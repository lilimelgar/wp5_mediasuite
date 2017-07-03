config = {
	#host & port you'd like to run the media suite on
	'APP_HOST' : '0.0.0.0',
	'APP_PORT' : 5302,
	'APP_VERSION' : 'v1.1',#this value gets updated only when a new tag is created

	'AUTHENTICATION_METHOD' : 'basic', #'OpenConnext', #options [OpenConnext, basic]
	'PW' : 'YOUR PASSWORD',

	#request access to live versions of these APIs via the owner of the repo
	'SEARCH_API' : 'http://localhost:5320',
	'SEARCH_API_PATH' : '/api/v1',

	'ANNOTATION_API' : 'http://localhost:5303',
	'ANNOTATION_API_PATH' : '/api',

	#TODO documentation on this will follow in a later stage
	'EXPORT_CONFIGS' : {
	}
}