from elasticsearch import Elasticsearch
from elasticsearch.client import IndicesClient
import json

class ElasticsearchUtil():

	@staticmethod
	def createIndex(es, indexName, settingsFile, mappingFile, delete = False):
		iclient = IndicesClient(es)

		#If specified, delete any existing index with the same name
		if delete and iclient.exists(indexName):
			iclient.delete(indexName)

		#else only create it if it does not exist
		if not iclient.exists(indexName):
			#Load the settings and mapping
			f = open(settingsFile)
			settings = json.load(f)
			f.close()
			f = open(mappingFile)
			mapping = json.load(f)
			f.close()

			#Create the index with the settings and mapping
			iclient.create(indexName, {'settings' : settings, 'mappings' : mapping})

	@staticmethod
	def getMatchAllQuery():
		return {"query":{"bool":{"must":[{"match_all":{}}],"must_not":[],"should":[]}},"from":0,"size":10,"sort":[],"aggs":{}}
