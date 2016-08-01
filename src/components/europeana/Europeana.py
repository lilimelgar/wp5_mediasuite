import simplejson
import urllib
import httplib2

#TODO this was copied from LinkedTV, make sure to fix this for the labs space!!! DOES NOT WORK YET!

"""
SEARCH API DOCS:
	http://www.europeana.eu/portal/api-search-json.html

FOR THE RIGHTS/LICENSES CHECK:
	http://pro.europeana.eu/share-your-data/rights-statement-guidelines/available-rights-statements
"""

class Europeana():

	def __init__(self):

		self.API_KEY = '1hfhGH67Jhs'#todo pull this from a config
		self.BASE_URL = 'http://www.europeana.eu/api/v2/search.json'
		self.RIGHTS = {
			'http://creativecommons.org/publicdomain/mark/1.0/' : ['open'],
			'http://www.europeana.eu/rights/out-of-copyright-non-commercial/' : ['restricted'],
			'http://creativecommons.org/publicdomain/zero/1.0/' : ['open'],

			'http://creativecommons.org/licenses/by/4.0/' : ['by'],
			'http://creativecommons.org/licenses/by/3.0/' : ['by'],
			'http://creativecommons.org/licenses/by/2.0/' : ['by'],
			'http://creativecommons.org/licenses/by/1.0/' : ['by'],

			'http://creativecommons.org/licenses/by-sa/4.0/' : ['by', 'sa'],
			'http://creativecommons.org/licenses/by-sa/3.0/' : ['by', 'sa'],
			'http://creativecommons.org/licenses/by-sa/2.0/' : ['by', 'sa'],
			'http://creativecommons.org/licenses/by-sa/1.0/' : ['by', 'sa'],

			'http://creativecommons.org/licenses/by-nd/4.0/' : ['by', 'nd', 'sa'],
			'http://creativecommons.org/licenses/by-nd/3.0/' : ['by', 'nd', 'sa'],
			'http://creativecommons.org/licenses/by-nd/2.0/' : ['by', 'nd', 'sa'],
			'http://creativecommons.org/licenses/by-nd/1.0/' : ['by', 'nd', 'sa'],

			'http://creativecommons.org/licenses/by-nc/4.0/' : ['by', 'nc'],
			'http://creativecommons.org/licenses/by-nc/3.0/' : ['by', 'nc'],
			'http://creativecommons.org/licenses/by-nc/2.0/' : ['by', 'nc'],
			'http://creativecommons.org/licenses/by-nc/1.0/' : ['by', 'nc'],

			'http://creativecommons.org/licenses/by-nc-sa/4.0/' : ['by', 'nc', 'sa'],
			'http://creativecommons.org/licenses/by-nc-sa/3.0/' : ['by', 'nc', 'sa'],
			'http://creativecommons.org/licenses/by-nc-sa/2.0/' : ['by', 'nc', 'sa'],
			'http://creativecommons.org/licenses/by-nc-sa/1.0/' : ['by', 'nc', 'sa'],

			'http://creativecommons.org/licenses/by-nc-nd/4.0/' : ['by', 'nc', 'nd'],
			'http://creativecommons.org/licenses/by-nc-nd/3.0/' : ['by', 'nc', 'nd'],
			'http://creativecommons.org/licenses/by-nc-nd/2.0/' : ['by', 'nc', 'nd'],
			'http://creativecommons.org/licenses/by-nc-nd/1.0/' : ['by', 'nc', 'nd'],

			'http://www.europeana.eu/rights/rr-f/' : ['restricted'],
			'http://www.europeana.eu/rights/rr-p/' : ['restricted', 'paid'],
			'http://www.europeana.eu/rights/orphan-work-eu/' : ['orphan'],
			'http://www.europeana.eu/rights/unknown/' : ['unknown']
		}
		self.DESIRED_AMOUNT_OF_RESULTS = 300

	def search(self, params):
		queryUrl, results = self.__search(params['q'])
		if queryUrl and results:
			#return { 'enrichments' : self.__formatResponse(results), 'queries' : [queryUrl]}
			return self.__formatResponse(results)
		return None

	def __search(self, query):
		http = httplib2.Http()
		url = self.__getServiceUrl(query)
		if url:
			headers = {'Content-type': 'application/json'}
			resp, content = http.request(url, 'GET', headers=headers)
			if content:
				return url, content
		return None, None

	def __getServiceUrl(self, query):
		query = urllib.quote(query.encode('utf8'))

		print query

		url = '%s?wskey=%s&query=%s' % (self.BASE_URL, self.API_KEY, query)
		#e.g. 'COUNTRY:netherlands'
		# if dimension['service']['params'].has_key('queryParts'):
		# 	for qf in dimension['service']['params']['queryParts']:
		# 		url += '&qf=%s' % qf
		url += self.__getRightsUrlPart(['sa', 'open', 'nc', 'by'])
		url += '&rows=%d' % self.DESIRED_AMOUNT_OF_RESULTS
		#print url
		return url

	def __getRightsUrlPart(self, rights):
		requestedRights = []
		for r in rights:
			for key in self.RIGHTS.keys():
				if r in self.RIGHTS[key]:
					requestedRights.append(key)
		#print requestedRights
		return  '&qf=RIGHTS:%s' % '&qf=RIGHTS:'.join(requestedRights)


	def __formatResponse(self, data):
		data = simplejson.loads(data)
		enrichments = []
		if data.has_key('items'):
			for e in data['items']:
				if e.has_key('title') and len(e['title']) > 0:
					enrichment = {
						'label' : e['title'][0],
						'url' : e['guid'],
						'enrichmentType' : e['type'],
						'description' : e['title'][0]
					}
					if e.has_key('dataProvider'):
						enrichment['source'] = e['dataProvider'][0]
					if e.has_key('year'):
						enrichment['year'] = e['year'][0]
					if e.has_key('edmPreview'):
						enrichment['poster'] = e['edmPreview'][0]
					#enrichment.setNativeProperties(e)
					enrichments.append(enrichment)
		return enrichments

if __name__ == '__main__':
	eu = Europeana()
	print eu.search('Appel')


