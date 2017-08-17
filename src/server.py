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

#exporting / generating indices for certain instances of LABO
from components.export.AnnotationExporter import AnnotationExporter

#standard python
import json
import os

#import the settings and put them in a global variable
from settings import config

#initialise the application object
app = Flask(__name__)
app.debug = True
app.config['RECIPES'] = None #loaded once when a recipe is requested for the first time
app.config['COLLECTION_DATA'] = None #loaded once on startup

"""------------------------------------------------------------------------------
AUTHENTICATION FUNCTIONS
------------------------------------------------------------------------------"""

def getUser(request):
	if config['AUTHENTICATION_METHOD'] == 'OpenConnext':
		if len(session)>0 and 'samlUserdata' in session:
			#print session['samlUserdata']
			if session['samlUserdata']['urn:oid:1.3.6.1.4.1.25178.1.2.9'][0]=='surfguest.nl':
				return {
					'id' : session['samlUserdata']['urn:mace:dir:attribute-def:displayName'][0], #TODO is there a real ID?
					'name' : session['samlUserdata']['urn:mace:dir:attribute-def:displayName'][0],
					'attributes' : session['samlUserdata']
				}
			else:
				return {
					'id' : session['samlUserdata']['urn:mace:dir:attribute-def:uid'][0], #TODO is there a real ID?
					'name' : session['samlUserdata']['urn:mace:dir:attribute-def:uid'][0],
					'attributes' : session['samlUserdata']
				}
	else: #basic auth
		return {
			'id' : 'clariah',
			'name' :'clariah',
			'attributes' : {}
		}
	return None

def isAuthenticated(request):
	if config['AUTHENTICATION_METHOD'] == 'OpenConnext':
		if len(session)==0:
			session['samlIsAuthenticated'] = False
		return session['samlIsAuthenticated']
	else:
		if request.authorization:
			if request.authorization.username == 'admin' and request.authorization.password == config['PW']:
				return True
	return False

#decorator that makes sure to check whether the user is authorized based on the configured authorization method
def requires_auth(f):
	@wraps(f)
	def decorated(*args, **kwargs):
		session['requestedURL'] = str(request.path)[1:]
		auth = isAuthenticated(request)
		#if not logged in redirect the user depending on the authentication method
		if not auth:
			if config['AUTHENTICATION_METHOD'] == 'OpenConnext':
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


#Needed for OpenConnext authentication
if config['AUTHENTICATION_METHOD'] == 'OpenConnext':
	from urlparse import urlparse
	from onelogin.saml2.auth import OneLogin_Saml2_Auth
	from onelogin.saml2.utils import OneLogin_Saml2_Utils
	from flask import (redirect, session, make_response, jsonify, url_for)
	from components.external.login import SamlManager
	from uuid import uuid4
	import requests
	import requests.auth
	import urllib

	#required for using sessions
	app.config['SECRET_KEY'] = 'openconext_request'
	app.config['SAML_PATH'] = os.path.join(os.path.abspath(os.path.dirname(__file__)),'components','external','login', 'saml')

	#init the SAMLManager
	_SAMLManager = SamlManager.SamlManager(app)

	#Needed for the OAUTH Token service
	OAuthClientID = config['OAUTH_CLIENT_ID']
	OAuthClientSecret = config['OAUTH_CLIENT_SECRET']

	@app.route('/metadata/')
	def saml_metadata():
		saml = SamlManager.SamlRequest(request)
		return saml.generate_metadata()

	#gets here only if the user has logged-in successfully, otherwise the user is stopped at the intermediate node
	@_SAMLManager.login_from_acs
	def acs_login(acs):
		print 'THE REQUESTED URL(ACS): %s' % session['requestedURL']
		if isAuthenticated(request):
			return redirect(requestOAuthCode(request.host))
		if 'errors' in acs:
			return render_template(
				'login-failed.html',
				errors=acs['errors'],
				version=config['APP_VERSION']
			)
		return redirect(url_for('home'))

	#1st OAuth step: request a code
	def requestOAuthCode(host):
		# Generate a random string for the state parameter
		# Save it for use later to prevent xsrf attacks
		params = {
			"client_id": OAuthClientID,
			"response_type": "code",
			"state": str(uuid4()),
			"redirect_uri": 'http://%s/get_code' % host,
			"duration": "temporary",
			"scope": "groups"
		}
		url = "https://authz.proxy.clariah.nl/oauth/authorize?" + urllib.urlencode(params)
		return url

	#callback URL for requestOAuthCode
	@app.route('/get_code')
	def onOAuthCodeReceived():
		error = request.args.get('error', '')
		if error:
			return "Error: " + error
		state = request.args.get('state', '')
		if not is_valid_state(state):
			# Uh-oh, this request wasn't started by us!
			abort(403)

		#Now request the OAuth token with the acquired code
		resp = requestOAuthToken(request.args.get('code'))
		if 'access_token' in resp:
			OAuthToken = resp['access_token']
			session['OAuthToken'] = OAuthToken
			print 'Acquired an OAuth token for asynchonous requests: %s' % session['OAuthToken']
		else:
			print resp

		#always redirect to the URL the user requested
		return redirect(url_for(session['requestedURL']))

	#2nd OAuth step: use the code to request an OAuth token
	def requestOAuthToken(code):
		client_auth = requests.auth.HTTPBasicAuth(OAuthClientID, OAuthClientSecret)
		post_data = {
			"grant_type": "authorization_code",
			"code": code,
			"redirect_uri": 'http://%s/get_code' % request.host
		}
		#headers = base_headers()
		response = requests.post(
			"https://authz.proxy.clariah.nl/oauth/token",
			auth=client_auth,
			headers={'Content-type': 'application/x-www-form-urlencoded'},
			data=post_data,
			verify=False
		)
		token_json = response.json()
		print token_json
		return token_json

	#useless function: maybe fill in later?
	def is_valid_state(state):
		return True

"""------------------------------------------------------------------------------
LOADING RECIPES FROM JSON FILES
------------------------------------------------------------------------------"""

#This function is only executed once on startup and should be used to load global variables/data
@app.before_first_request
def serverInit():
	session['samlIsAuthenticated'] = False
	loadRecipes()

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
PING / HEARTBEAT ENDPOINT
------------------------------------------------------------------------------"""

@app.route('/ping')
def ping():
	return Response('pong', mimetype='text/plain')

"""------------------------------------------------------------------------------
STATIC PAGES THAT DO NOT USE THE COMPONENT LIBRARY
------------------------------------------------------------------------------"""

@app.route('/')
def home():
	#check logged in
	for c in request.cookies:
		print c
	return render_template('index.html', user=getUser(request), version=config['APP_VERSION'])

@app.route('/robots.txt')
@app.route('/sitemap.xml')
def static_from_root():
	return send_from_directory(app.static_folder, request.path[1:])

@app.route('/favicon.jpeg')
def favicon():
	return getFavicon()

@app.route('/help-feedback')
def helpfeedback():
	return render_template('help-feedback.html', user=getUser(request), version=config['APP_VERSION'])

@app.route('/datasources')
def datasources():
	return render_template('data-sources.html', user=getUser(request), version=config['APP_VERSION'])

@app.route('/apis')
@requires_auth
def apis():
	return render_template('apis.html',
		user=getUser(request),
		version=config['APP_VERSION'],
		searchAPI=config['SEARCH_API'],
		annotationAPI=config['ANNOTATION_API']
	)

@app.route('/userspace')
@requires_auth
def userspace():
	return render_template('userspace.html',
		user=getUser(request),
		version=config['APP_VERSION'],
		searchAPI=config['SEARCH_API'],
		annotationAPI=config['ANNOTATION_API']
	)

@app.route('/recipes')
@requires_auth
def recipes():
	return render_template(
		'recipes.html',
			recipes=app.config['RECIPES'],
			user=getUser(request),
			version=config['APP_VERSION']
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
		OAuthToken = None
		if 'OAuthToken' in session:
			OAuthToken = OAuthToken
		return render_template(
			'recipe.html',
				recipe=recipe,
				params=params,
				instanceId='clariah',
				searchAPI=config['SEARCH_API'],
				searchAPIPath=config['SEARCH_API_PATH'],
				user=getUser(request),
				version=config['APP_VERSION'],
				annotationAPI=config['ANNOTATION_API'],
				annotationAPIPath=config['ANNOTATION_API_PATH'],
				OAuthToken=OAuthToken
		)

	return render_template('404', user=getUser(request)), 404

@app.route('/components')
@requires_auth
def components():
	return render_template('components.html',
		user=getUser(request),
		version=config['APP_VERSION'],
		instanceId='clariah',
		searchAPI=config['SEARCH_API'],
		searchAPIPath=config['SEARCH_API_PATH'],
		annotationAPI=config['ANNOTATION_API'],
		annotationAPIPath=config['ANNOTATION_API_PATH']
	)

"""------------------------------------------------------------------------------
EXPORT API
------------------------------------------------------------------------------"""

@app.route('/export')
@requires_auth
def export():
	script = request.args.get('s', None)
	operation = request.args.get('o', None)
	if script:
		ex = AnnotationExporter(config)
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
@requires_auth
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
			u = Unesco(config)
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
@requires_auth
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
	return render_template('404.html', user=getUser(request), version=config['APP_VERSION']), 404

@app.errorhandler(500)
def page_not_found(e):
	return render_template('500.html', user=getUser(request), version=config['APP_VERSION']), 500

#main function that will run the server
if __name__ == '__main__':
	app.run(port=config['APP_PORT'], host=config['APP_HOST'])
