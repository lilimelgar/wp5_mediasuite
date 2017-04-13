import os
import requests
import json
import copy

class CollectionDataHandler():
	def __init__(self, config, apikey=None):
		self.config = config

	def loadData(self):
		collectionData = None

		cacheFile = self.config['COLLECTION_CACHE']
		print 'Cache file: %s' % cacheFile
		#first check the cache
		if os.path.exists(cacheFile):
			print 'Reading the collection data from cache'
			collectionData = json.load(open(cacheFile, 'r'))
		else:#otherwise load it from CKAN
			print 'Loading data from CKAN'
			collectionData = self.__loadFromCKAN()

			#and write it to the cache
			print 'Writing collection data to cache'
			f = open(cacheFile, 'w+')
			prettyData = json.dumps(collectionData, indent=4, sort_keys=True)
			f.write(prettyData)
			print prettyData
			f.close()
		return collectionData

	"""----------------------- FUNCTIONS WORKING ON THE COLLECTION DATA ------------------------"""

	def getImportedCollections(self, collectionData):
		temp = {} #keeps track of duplicates
		collections = []
		for collectionName, metadata in collectionData.iteritems():
			for resource in metadata["resources"]:
				if resource["format"] in ["elasticsearch/json","Elasticsearch/JSON"]:
					if not metadata['id'] in temp:
						c = copy.deepcopy(metadata)
						c.pop('resources', None)
						c['index'] = resource['url'][resource['url'].rfind('/')+1:]
						collections.append(c)
						temp[c['id']] = True

		collections.sort(key = lambda x: x['title'])
		return collections

	#gets the CKAN collection by the ES index name! TODO CKAN & ES ids should be synched!
	def getImportedCollection(self, collectionData, collectionId):
		c = None
		for collectionName, metadata in collectionData.iteritems():
			for resource in metadata["resources"]:
				if resource["url"] == '%s%s' % ('http://blofeld.beeldengeluid.nl:5320/api/v1/search/', collectionId):
					c = copy.deepcopy(metadata)
					c.pop('resources', None)
					c['index'] = resource['url'][resource['url'].rfind('/')+1:]
					break
		return c

	"""----------------------- FUNCTIONS CALLING CKAN ------------------------"""

	def __loadFromCKAN(self):
		collectionData = {}
		for collectionName in self.__listCKANCollections():
			collectionData[collectionName] = self.__getCKANCollectionMetadata(collectionName)
		return collectionData

	def __listCKANCollections(self):
		response = requests.get(self.config['HOST'] + "/api/action/package_list")
		return response.json()['result']

	def __getCKANCollectionMetadata(self, collectionName):
		response = requests.get(self.config['HOST'] + "/api/action/package_show?id=" + collectionName)
		return response.json()['result']

	"""----------------------- PRINT FUNCTIONS ------------------------"""

	def __printCollection(self, collection):
		print 'Dataset: ',collection["title"]
		for resource in collection["resources"]:
			self.__printResource(resource)

	def __printCollectionData(self, collectionData):
		for collectionName, metadata in collectionData.iteritems():
			for resource in metadata["resources"]:
				if resource["format"] in ["elasticsearch/json","Elasticsearch/JSON"]:
					print 'Collection: ', collectionName
					print 'Notes: ', metadata["notes"]
					print  '\n++++++++++++++++++++++++++++++++++++++++++++++++++++'
					self.__printResource(resource)
					print 'Organization: ', metadata["organization"]["title"]
					print '\n*********************************************************'

	def __printResource(self, resource):
		print 'Resource: ',resource["name"]
		print 'URL: ',resource["url"]
		print 'Description: ',resource["description"]
		print '----------------------------------------'
