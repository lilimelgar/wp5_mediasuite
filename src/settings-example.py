config = {
	#webserver parameters
	'APP_HOST' : '0.0.0.0',
	'APP_PORT' : 5302,

	"""
	To override certain defaults, it is possible to create a dir using the INSTANCE_NAME in:

	src/templates (for HTML files)
	src/resources/recipes (for the available recipes in JSON format)
	src/static/images (for the logo in the navbar or additional custom images)
	src/static/css (for overriding the default styling)
	src/static/sass	(using compass watch in src/static, this will generate the CSS output of SASS into src/static/css)

	"""

	'INSTANCE_NAME' : 'YOUR_INSTANCE_NAME' # entering 'default' or omitting this propery loads the default
}