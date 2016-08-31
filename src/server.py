from flask import Flask
from flask import render_template
from flask import request, Response

from jinja2.exceptions import TemplateNotFound

from functools import wraps

from components.openskos.OpenSKOS import OpenSKOS
from components.dbpedia.DBpedia import DBpedia
from components.wikidata.WikiData import WikiData
from components.europeana.Europeana import Europeana

import simplejson
import os

app = Flask(__name__)
app.debug = True
app.config['RECIPES'] = None

import settings

_config = settings.config

"""------------------------------------------------------------------------------
LOADING RECIPES FROM JSON FILES
------------------------------------------------------------------------------"""

def loadRecipes():
	recipes = {}
	for root, directories, files in os.walk(_config['RECIPES_PATH']):
		for fn in files:
			r = os.path.join(root, fn)
			recipes[fn.replace('.json', '')] = simplejson.load(open(r, 'r'))
	app.config['RECIPES'] = recipes

"""------------------------------------------------------------------------------
GLOBAL FUNCTIONS
------------------------------------------------------------------------------"""


def getErrorMessage(msg):
	return simplejson.dumps({'error' : msg})

def getSuccessMessage(msg, data):
	return simplejson.dumps({'success' : msg, 'data' : data})

"""------------------------------------------------------------------------------
AUTHENTICATION
------------------------------------------------------------------------------"""

def check_auth(username, password):
	return username == 'admin' and password == '1234'

def authenticate():
	return Response(
	'Could not verify your access level for that URL.\n'
	'You have to login with proper credentials', 401,
	{'WWW-Authenticate': 'Basic realm="Login Required"'})

def isLoggedIn(request):
	if request.authorization:
		return True
	return False

def requires_auth(f):
	@wraps(f)
	def decorated(*args, **kwargs):
		auth = request.authorization
		if not auth or not check_auth(auth.username, auth.password):
			return authenticate()
		return f(*args, **kwargs)
	return decorated

def getTemplateImages(templateName):
	navbarLogo = '/static/images/default/logo.png'
	if os.path.exists(os.path.join(app.root_path, 'static', 'images', 'custom', 'logo.png')):
		navbarLogo = '/static/images/custom/logo.png'
	pageImage = '/static/images/default/%s.png' % templateName
	if os.path.exists(os.path.join(app.root_path, 'static', 'images', 'custom', '%s.png' % templateName)):
		pageImage = '/static/images/custom/%s.png' % templateName
	return navbarLogo, pageImage

def renderTemplate(name, params = {}):
	#see if a special template is configured
	template = 'default'
	if _config.has_key('CUSTOM_TEMPLATE_DIR'):
		template = _config['CUSTOM_TEMPLATE_DIR']

	#get image data based on the template
	navbarLogo, pageImage = getTemplateImages(name)

	#set the params for the render_template function
	params['pageImage'] = pageImage
	params['navbarLogo'] = navbarLogo

	#test if the nav.html exists
	try:
		render_template(
			'%s/nav.html' % template,
			**params
		)
		params['template'] = template
	except TemplateNotFound, e:
		print 'nav template was not defined'
		params['template'] = 'default'


	#try to load the custom template
	try:
		print 'LOADING: %s/%s.html' % (template, name)
		return render_template(
			'%s/%s.html' % (template, name),
			**params
		)
	except TemplateNotFound, e:
		print 'Template does not exist, loading the default template. Please check your settings.py'
		print e

	#if the custom template does not exist, always load the default one
	return render_template(
		'default/%s.html' % name,
		**params
	)

"""------------------------------------------------------------------------------
STATIC PAGES THAT YOU CAN CUSTOMIZE
------------------------------------------------------------------------------"""

@app.route('/')
def home():
	return renderTemplate('index', {'loggedIn' : isLoggedIn(request)})

@app.route('/about')
def about():
	return renderTemplate('about', {'loggedIn' : isLoggedIn(request)})

@app.route('/contact')
def contact():
	return renderTemplate('contact', {'loggedIn' : isLoggedIn(request)})

@app.route('/apis')
def apis():
	return renderTemplate('apis', {'loggedIn' : isLoggedIn(request)})

@app.route('/components')
def components():
	return renderTemplate('components', {'loggedIn' : isLoggedIn(request)})

@app.route('/recipes')
def recipes():
	if app.config['RECIPES'] == None:
		loadRecipes()
	return renderTemplate(
		'recipes', {
			'recipes' : app.config['RECIPES'],
			'loggedIn' : isLoggedIn(request)
		}
	)

@app.route('/recipe/<recipeId>')
def recipe(recipeId):
	#flatten the params and put them in a normal dict
	params = {}
	for x in dict(request.args).keys():
		params[x] = request.args.get(x)

	if app.config['RECIPES'] == None:
		loadRecipes()
	if app.config['RECIPES'].has_key(recipeId):
		return renderTemplate(
			'recipe', {
				'recipe' : app.config['RECIPES'][recipeId],
				'params' : params,
				'loggedIn' : isLoggedIn(request)
			}
		)
	print app.config['RECIPES']
	return renderTemplate('404', {'loggedIn' : isLoggedIn(request)}), 404

"""------------------------------------------------------------------------------
TEMPORARY VOCABULARY 'API'
------------------------------------------------------------------------------"""

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
		if options:
			return Response(simplejson.dumps(options), mimetype='application/json')
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
		return Response(simplejson.dumps(resp), mimetype='application/json')
	return Response(getErrorMessage('Nothing found'), mimetype='application/json')


"""------------------------------------------------------------------------------
ERROR HANDLERS
------------------------------------------------------------------------------"""

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def page_not_found(e):
    return render_template('404.html'), 500


if __name__ == '__main__':
	app.run(port=_config['API_PORT'], host=_config['API_HOST'])
