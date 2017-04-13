#flask imports
from flask import Flask
from flask import render_template, abort
from flask import request, Response, send_from_directory
from jinja2.exceptions import TemplateNotFound
from functools import wraps

#for autocompletion & searching through external collections
from components.external.openskos.OpenSKOS import OpenSKOS
from components.external.dbpedia.DBpedia import DBpedia
from components.external.wikidata.WikiData import WikiData
from components.external.europeana.Europeana import Europeana
from components.external.unesco.Unesco import Unesco

#for loading the collections from CKAN
from components.collection.CollectionDataHandler import CollectionDataHandler

#exporting / generating indices for certain instances of LABO
from components.export.AnnotationExporter import AnnotationExporter

#standard python
import json
import os

#import the settings and put them in a global variable
import settings
_config = settings.config

#initialise the application object
app = Flask(__name__)
app.debug = True
app.config['RECIPES'] = None #loaded once when a recipe is requested for the first time
app.config['COLLECTION_DATA'] = None #loaded once on startup

#Needed for OpenConnext authentication
if _config['AUTHENTICATION_METHOD'] == 'OpenConnext':
	from urlparse import urlparse
	from components.external.login.onelogin.saml2.auth import OneLogin_Saml2_Auth
	from components.external.login.onelogin.saml2.utils import OneLogin_Saml2_Utils
	from flask import (redirect, session, make_response, jsonify, url_for)
	from components.external.login import SamlManager

	app.config['SECRET_KEY'] = 'openconext_request'
	app.config['SAML_PATH'] = os.path.join(os.path.abspath(os.path.dirname(__file__)),'components','external','login', 'saml')

	_SAMLManager = SamlManager.SamlManager()
	_SAMLManager.init_app(app)
	_SAMLManager.lastRequest = 'home'
	_SAMLManager.isAuthenticated = False


"""
This function is only executed once on startup and should be used to load global variables/data
"""
@app.before_first_request
def serverInit():
	#load the recipes whenever the server restarts
	loadRecipes()

"""------------------------------------------------------------------------------
LOADING RECIPES FROM JSON FILES
------------------------------------------------------------------------------"""

def loadRecipes():
	recipes = {}
	recipeDir = 'default'
	for root, directories, files in os.walk(os.path.join(app.root_path, 'resources', 'recipes')):
		for fn in files:
			print fn
			if fn.find('.json') != -1:
				path = os.path.join(root, fn)
				recipe = json.load(open(path, 'r'))

				#add the standard URL for recipes that have no URL defined.
				if not 'url' in recipe:
					recipe['url'] = '/recipe/%s' % recipe['id'];

				recipes[fn.replace('.json', '')] = recipe
	app.config['RECIPES'] = recipes

"""------------------------------------------------------------------------------
UNIFIED DEFAULT SUCCESS & ERROR RESPONSE FUNCTIONS
------------------------------------------------------------------------------"""

def getErrorMessage(msg):
	return json.dumps({'error' : msg})

def getSuccessMessage(msg, data):
	return json.dumps({'success' : msg, 'data' : data})

"""------------------------------------------------------------------------------
AUTHENTICATION FUNCTIONS
------------------------------------------------------------------------------"""

def getUser(request):
	if _config['AUTHENTICATION_METHOD'] == 'OpenConnext':
		if len(session)>0:
			return {
				'id' : session['samlUserdata']['urn:mace:dir:attribute-def:displayName'][0], #TODO is there a real ID?
				'name' : session['samlUserdata']['urn:mace:dir:attribute-def:displayName'][0],
				'attributes' : session['samlUserdata']
			}
	else: #basic auth
		return {
			'id' : 'clariah',
			'name' :'clariah',
			'attributes' : {}
		}
	return None

def isAuthenticated(request, authMethod):
	success = False
	if authMethod == 'OpenConnext':
		_SAMLManager.lastRequest =  request.path
		_SAMLManager.lastRequest = str(_SAMLManager.lastRequest)[1:]
		success = _SAMLManager.isAuthenticated
		if len(session)==0:
			success = False
	else:
		if request.authorization:
			if request.authorization.username == 'admin' and request.authorization.password == _config['PW']:
				success = True
	return success

#decorator that makes sure to check whether the user is authorized based on the configured authorization method
def requires_auth(f):
	@wraps(f)
	def decorated(*args, **kwargs):
		auth = isAuthenticated(request, _config['AUTHENTICATION_METHOD'])

		#if not logged in redirect the user depending on the authentication method
		if not auth:
			if _config['AUTHENTICATION_METHOD'] == 'OpenConnext':
				return redirect(url_for('login'))
			else: #basic auth
				return Response(
					'Could not verify your access level for that URL.\n'
					'You have to login with proper credentials', 401,
					{'WWW-Authenticate': 'Basic realm="Login Required"'}
				)

		#otherwise the user can access the originally requested page
		return f(*args, **kwargs)
	return decorated


"""
END-POINTS NEEDED FOR OPENCONNEXT AUTHENTICATION
------------------------------------------------------------------------------"""

if _config['AUTHENTICATION_METHOD'] == 'OpenConnext':
	@app.route('/metadata/')
	def saml_metadata():
		saml = SamlManager.SamlRequest(request)
		return saml.generate_metadata()

	@_SAMLManager.login_from_acs
	def acs_login(acs):
		#gets here only if the user has logged-in successfully, otherwise the user is stopped at the intermediate node
		_SAMLManager.isAuthenticated = True
		return redirect(url_for(_SAMLManager.lastRequest))

"""------------------------------------------------------------------------------
STATIC PAGES THAT DO NOT USE THE COMPONENT LIBRARY
------------------------------------------------------------------------------"""

@app.route('/')
def home():
	#check logged in
	for c in request.cookies:
		print c
	return render_template('index.html', user=getUser(request))

@app.route('/robots.txt')
@app.route('/sitemap.xml')
def static_from_root():
    return send_from_directory(app.static_folder, request.path[1:])

@app.route('/favicon.jpeg')
def favicon():
	return getFavicon()

@app.route('/help-feedback')
def helpfeedback():
	return render_template('help-feedback.html', user=getUser(request))

@app.route('/datasources')
def datasources():
	return render_template('data-sources.html', user=getUser(request))

@app.route('/apis')
@requires_auth
def apis():
	return render_template('apis.html',
		user=getUser(request),
		searchAPI=_config['SEARCH_API'],
		annotationAPI=_config['ANNOTATION_API']
	)

@app.route('/userspace')
@requires_auth
def userspace():
	return render_template('userspace.html',
		user=getUser(request),
		searchAPI=_config['SEARCH_API'],
		annotationAPI=_config['ANNOTATION_API']
	)

@app.route('/recipes')
@requires_auth
def recipes():
	return render_template(
		'recipes.html',
			recipes=app.config['RECIPES'],
			user=getUser(request)
	)

"""------------------------------------------------------------------------------
PAGES THAT DO USE THE COMPONENT LIBRARY
------------------------------------------------------------------------------"""

@app.route('/recipe/<recipeId>')
@requires_auth
def recipe(recipeId):
	#flatten the params and put them in a normal dict
	params = {}
	for x in dict(request.args).keys():
		params[x] = request.args.get(x)

	if app.config['RECIPES'].has_key(recipeId):
		recipe = app.config['RECIPES'][recipeId]

		return render_template(
			'recipe.html',
				recipe=recipe,
				params=params,
				instanceId='clariah',
				user=getUser(request),
				searchAPI=_config['SEARCH_API'],
				searchAPIPath=_config['SEARCH_API_PATH'],
				annotationAPI=_config['ANNOTATION_API'],
				annotationAPIPath=_config['ANNOTATION_API_PATH']
		)

	return render_template('404', user=getUser(request)), 404

@app.route('/components')
@requires_auth
def components():
	return render_template('components.html',
		user=getUser(request),
		instanceId='clariah',
		searchAPI=_config['SEARCH_API'],
		searchAPIPath=_config['SEARCH_API_PATH'],
		annotationAPI=_config['ANNOTATION_API'],
		annotationAPIPath=_config['ANNOTATION_API_PATH']
	)

"""------------------------------------------------------------------------------
TEMPORARY EXPORT API
------------------------------------------------------------------------------"""

@app.route('/export')
@requires_auth
def export():
	script = request.args.get('s', None)
	operation = request.args.get('o', None)
	if script:
		ex = AnnotationExporter(_config)
		resp = ex.execute(script, operation)
		if resp:
			return Response(getSuccessMessage('Succesfully run the %s script' % script, resp), mimetype='application/json')
		return Response(getErrorMessage('Failed to run the %s script' % script), mimetype='application/json')
	return Response(getErrorMessage('Please provide all the necessary parameters'), mimetype='application/json')

"""------------------------------------------------------------------------------
AUTOCOMPLETE END POINT
------------------------------------------------------------------------------"""

#see the components.external package for different autocompletion APIs
@app.route('/autocomplete')
def autocomplete():
	term = request.args.get('term', None)
	vocab = request.args.get('vocab', 'DBpedia')
	conceptScheme = request.args.get('cs', None) #only for GTAA (not used yet!!)
	if term:
		options = None
		if vocab == 'GTAA':
			handler = OpenSKOS()
			options = handler.autoCompleteTable(term.lower(), conceptScheme)
		elif vocab == 'DBpedia':
			dac = DBpedia()
			options = dac.autoComplete(term)#dbpedia lookup seems down...
		elif vocab == 'UNESCO':
			u = Unesco(_config)
			options = u.autocomplete(term)
		if options:
			return Response(json.dumps(options), mimetype='application/json')
		else:
			return Response(getErrorMessage('Nothing found'), mimetype='application/json')
	return Response(getErrorMessage('Please specify a search term'), mimetype='application/json')

#TODO later dynamically load the api class as well:
#See: http://stackoverflow.com/questions/4246000/how-to-call-python-functions-dynamically
#TODO also create a separate API for this, with a nice swagger def
#FIXME summary: this is pretty basic and not yet generic enough
@app.route('/link/<api>/<command>')
def link(api, command):
	resp = None
	apiHandler = None
	params = request.args
	if api == 'wikidata':
		apiHandler = WikiData()
		if command == 'get_entity':
			params = {
				'ids' : [request.args.get('id')],
				'get_references' : True,
				'props' : ("labels", "descriptions", "sitelinks"),
				'languages' : ['nl']
			}
	elif api == 'europeana':
		apiHandler = Europeana()
	if apiHandler:
		resp = resp = getattr(apiHandler, "%s" % command)(params)
	if resp:
		return Response(json.dumps(resp), mimetype='application/json')
	return Response(getErrorMessage('Nothing found'), mimetype='application/json')


"""------------------------------------------------------------------------------
ERROR HANDLERS
------------------------------------------------------------------------------"""

#TODO fix the underlying template
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html', user=getUser(request)), 404

@app.errorhandler(500)
def page_not_found(e):
    return render_template('500.html', user=getUser(request)), 500


#main function that will run the server
if __name__ == '__main__':
	app.run(port=_config['APP_PORT'], host=_config['APP_HOST'])
