from flask import Flask
from flask import render_template
from flask import request, Response


from functools import wraps

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

"""------------------------------------------------------------------------------
REGULAR ROUTING (STATIC CONTENT)
------------------------------------------------------------------------------"""

@app.route('/')
def home():
	return render_template('index.html', loggedIn=isLoggedIn(request))

@app.route('/about')
def about():
	return render_template('about.html', loggedIn=isLoggedIn(request))

@app.route('/contact')
def contact():
	return render_template('contact.html', loggedIn=isLoggedIn(request))

@app.route('/collections')
def collections():
	return render_template('collections.html', loggedIn=isLoggedIn(request))

@app.route('/annotatevideo')
def annotatevideo():
	return render_template('annotate-video.html', loggedIn=isLoggedIn(request))

@app.route('/apis')
def apis():
	return render_template('apis.html', loggedIn=isLoggedIn(request))

@app.route('/components')
def components():
	return render_template('components.html', loggedIn=isLoggedIn(request))

@app.route('/recipes')
def recipes():
	if app.config['RECIPES'] == None:
		loadRecipes()
	colorMap = ['#ffb74d', '#a7ffeb', '#009fda', '#cfd8dc',	'#e00034',
		'#81c784', '#ffab91', '#adadad', '#5cb85c', 'dodgerblue']
	return render_template(
		'recipes.html',
		recipes=app.config['RECIPES'],
		colorMap=colorMap,
		loggedIn=isLoggedIn(request)
	)

@app.route('/recipe/<recipeId>')
def recipe(recipeId):
	if app.config['RECIPES'] == None:
		loadRecipes()
	if app.config['RECIPES'].has_key(recipeId):
		return render_template(
			'recipe.html',
			recipe=app.config['RECIPES'][recipeId],
			loggedIn=isLoggedIn(request)
		)
	print app.config['RECIPES']
	return render_template('404.html'), 404

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
