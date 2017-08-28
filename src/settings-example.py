class Config(object):
	APP_HOST = '0.0.0.0'
	APP_PORT = 5304
	APP_VERSION = 'v1.1'

	SECRET_KEY = 'some unique string' #required for using sessions

	AUTHENTICATION_METHOD = 'basic' #'OpenConnext', #options [OpenConnext, basic]
	OAUTH_CLIENT_ID = 'oauth client id'
	OAUTH_CLIENT_SECRET = 'oauth client secret'
	AUTHZ_SERVER = 'https://yourauthzserver'
	PW = '12345'

	SEARCH_API = 'http://localhost:5320'
	SEARCH_API_PATH = '/api/v1.1'

	ANNOTATION_API = 'http://localhost:5305'
	ANNOTATION_API_PATH = '/api'

	EXPORT_CONFIGS = {

	}