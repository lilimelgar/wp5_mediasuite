from flask import Flask
from flask import render_template
from flask import request, Response


from functools import wraps

import simplejson

app = Flask(__name__)
app.debug = True

import settings

_config = settings.config


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

@app.route('/search')
def search():
	return render_template('search.html', loggedIn=isLoggedIn(request))

@app.route('/apis')
def apis():
	return render_template('apis.html', loggedIn=isLoggedIn(request))

@app.route('/semweb')
def semweb():
	return render_template('semweb.html', loggedIn=isLoggedIn(request))

@app.route('/recipes')
def recipes():
	return render_template('recipe.html', loggedIn=isLoggedIn(request))

if __name__ == '__main__':
	app.run(port=_config['API_PORT'], host=_config['API_HOST'])
