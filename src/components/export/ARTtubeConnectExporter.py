#coding: utf8
from elasticsearch import Elasticsearch, RequestsHttpConnection
from elasticsearch.exceptions import NotFoundError
import base64
import requests
import json
import copy
import uuid
from datetime import datetime

from components.util.ElasticsearchUtil import ElasticsearchUtil
from components.util.AnnotationUtil import AnnotationUtil

#TODO adapt export to simpler annotation templates
class ARTtubeConnectExporter():

	def __init__(self, config):
		self.config = config
		print 'Setting up ES'
		self.es = Elasticsearch(
			host=config['ES_HOST'],
			port=config['ES_PORT']
		)
		self.VIMEO_PAGE_SIZE = 15
		self.ANNOTATION_USER = 'arttube'
		self.INDEX_NAME = 'arttube'
		self.DOC_TYPE = 'episode'
		self.SEG_INDEX_NAME = 'arttube__enrichments'
		self.SEG_DOC_TYPE = 'media_fragment'

	#the single public function that orchestrates everything
	def run(self, operation):
		if operation == 'ri':
			return self.__reindex()
		elif operation == 'ea':
			return self.__exportAnnotations()
		return None

	#override the default function
	def __exportAnnotations(self):
		print 'Exporting annotations'
		annotations = AnnotationUtil.getAnnotationsOfCollection(
			self.ANNOTATION_USER,
			self.INDEX_NAME,
			self.config['ANNOTATION_API']
		)
		return self.__toVideoDockPlayerFormat(annotations)
		#return annotations

	#format for the VD ARTtube player
	def __toVideoDockPlayerFormat(self, annotationData):
		items = []
		if type(annotationData) == dict:
			for videoURL in annotationData:
				annotations = []
				for a in annotationData[videoURL]:
					fa = {}
					if 'start' in a:
						fa['start'] = a['start']
					if 'end' in a:
						fa['end'] = a['end']
					if 'annotationTemplate' in a:
						fa['type'] = a['annotationTemplate']
						if 'url' in a['metadata'] and (fa['type'] == 'video' or fa['type'] == 'audio'):
							print 'getting A/V metadata for video annotation'
							print a['metadata']['url']
							av = self.__getMyVideo(
								self.__getVideoID(a['metadata']['url']), True
							)
							if av:
								fa['url'] = av['url']
								fa['images'] = av['images']
								fa['title'] = av['title']

					#copy all metadata 1 on 1
					if 'metadata' in a:
						for k,v in a['metadata'].iteritems():
							fa[k] = v

					annotations.append(fa)
				items.append({
					'video' : self.__getMyVideo(
						self.__getVideoID(videoURL), True
					),
					'annotations' : annotations
				})
		print items
		return items

	#override the default function
	def __reindex(self):
		if 'API_KEY' in self.config:
			ElasticsearchUtil.createIndex(
				self.es,
				self.INDEX_NAME,
				self.config['ES_SETTINGS_FILE'],
				self.config['ES_COLLECTION_MAPPING_FILE'],
				self.config['DELETE_OLD_INDICES']
			)
			ElasticsearchUtil.createIndex(
				self.es,
				self.SEG_INDEX_NAME,
				self.config['ES_SETTINGS_FILE'],
				self.config['ES_ANNOTATION_MAPPING_FILE'],
				self.config['DELETE_OLD_INDICES']
			)
			count = 0
			for v in self.__getMyVideos(1):
				mediaObject, segmentAnnotations = self.__generateIndexData(v)
				#print json.dumps(mediaObject, indent=4, sort_keys=True)
				if not self.__existsInIndex(mediaObject['resourceId']):
					print 'Indexing %s (%s)' % (mediaObject['resourceId'], mediaObject['date'])
					self.__indexResource(
						mediaObject,
						segmentAnnotations,
					)
					count += 1
				else:
					print '%s already exists' % mediaObject['resourceId']
					break
			return {
				'message' : 'Processed %d videos from the Boijmans Vimeo account' % count
			}
		print 'Please get an API_KEY for the intended vimeo account'
		return None

	def __getMyVideos(self, page):
		url = 'https://api.vimeo.com/me/videos?per_page=%d&page=%d' % (self.VIMEO_PAGE_SIZE, page)
		headers = {
			'Authorization' : 'Bearer %s' % self.config['API_KEY'],
			'Accept': 'application/vnd.vimeo.*+json;version=3.2'
		}
		resp = requests.get(url, headers=headers)
		if resp and resp.status_code == 200:
			data = json.loads(resp.text)
			if 'data' in data:
				for v in data['data']:
					if 'link' in v:
						yield v

				#uncomment after it all works
				if 'next' in data['paging'] and data['paging']['next']:
					print 'Getting next page: %s' % data['paging']['next']
					for v in self.__getMyVideos(int(data['page']) +1):
						yield v

	def __getMyVideo(self, videoID, arttubeCherryPick = False):
		print videoID
		url = 'https://api.vimeo.com/videos/%s?sort=date&direction=desc' % videoID
		headers = {
			'Authorization' : 'Bearer %s' % self.config['API_KEY'],
			'Accept': 'application/vnd.vimeo.*+json;version=3.2'
		}
		resp = requests.get(url, headers=headers)
		if resp and resp.status_code == 200:
			data = json.loads(resp.text)
			if arttubeCherryPick:
				metadata = {
					'title' : data['name'],
					'url' : 'http://player.vimeo.com/video/%s' % videoID,
					'images' : {}
				}
				if 'pictures' in data and 'sizes' in data['pictures']:
					thumbnails = data['pictures']['sizes']
				if thumbnails:
					if len(thumbnails) > 2:
						metadata['images']['timeline'] = thumbnails[2]['link']
					if len(thumbnails) > 3:
						metadata['images']['sidebar'] = thumbnails[3]['link']
						if len(thumbnails) == 4:
							metadata['images']['poster'] = thumbnails[3]['link']
					if len(thumbnails) == 5:
						metadata['images']['poster'] = thumbnails[4]['link']
					if len(thumbnails) == 6:
						metadata['images']['poster'] = thumbnails[5]['link']
				return metadata
			else: #just return the entire response
				return data
		return None

	#TODO not completely safe, not checking all the keys in the data
	def __generateIndexData(self, vimeoVideo):
		mediaObject = None
		segments = []
		if vimeoVideo:
			#determine the video URL (TODO test the new function)
			videoURL = self.__transposeVideoURL(vimeoVideo['link'])
			"""
			videoURL = 'http://player.vimeo.com/video/%s' % (
				vimeoVideo['link'][len('https://vimeo.com/'):]
			)
			"""

			#format the date
			ds = vimeoVideo['release_time']
			d = datetime.strptime(ds, '%Y-%m-%dT%H:%M:%S+00:00')
			esDate = d.strftime('%d-%m-%Y')

			#determine the poster
			posterURL = None
			thumbnails = None
			if 'pictures' in vimeoVideo and vimeoVideo['pictures'] and 'sizes' in vimeoVideo['pictures']:
				thumbnails = vimeoVideo['pictures']['sizes']
				if len(vimeoVideo['pictures']['sizes']) > 1:
					if 'link' in vimeoVideo['pictures']['sizes'][1]:
						posterURL = vimeoVideo['pictures']['sizes'][1]['link']
			else:
				print 'No pictures for: %s' % videoURL
			mediaObject = {
				'resourceId' : vimeoVideo['resource_key'],
				'collectionId' : 'arttube',
				'title' : vimeoVideo['name'],
				'posterURL' : posterURL,
				'thumbnails' : thumbnails,
				'description' : vimeoVideo['description'],
				'date' : esDate,
				'playableContent' : [{
					'url' : videoURL,
					'mimeType' : 'video/mp4',
					'assetId' : vimeoVideo['uri']
				}]
			}
			if 1 == 2:
				url = '%s/api/annotations/filter?target.source=%s&user=arttube' % (
					self.config['ANNOTATION_API'],
					videoURL
				)
				resp = requests.get(url)
				if resp.status_code == 200:
					data = json.loads(resp.text)
					if data and 'annotations' in data:
						for a in data['annotations']:
							if 'body' in a and a['body']:
								#these are the segments
								#TODO think about how to deal with different types of cards!
								if 'selector' in a['target'] and a['target']['selector']:
									title = None
									start = float(a['target']['selector']['start']) * 1000
									end = float(a['target']['selector']['end']) * 1000
									tags = None

									#grab the segment title from the cards
									cards = [x for x in a['body'] if x['annotationType'] == 'metadata']
									if len(cards) > 0:
										title = self.__getCardPropertyValue(cards[0], 'title')

									#grab the segment tags
									classifications = [x for x in a['body'] if x['annotationType'] == 'classification']
									if len(classifications) > 0:
										tags = [x['label'] for x in classifications]

									segment = {
										'start' : start,
										'end' : end
									}
									if title:
										segment['title'] = title
									if tags:
										segment['tags'] = tags
										segment['tags_raw'] = tags
									segments.append(segment)

								#these are the annotations made on the document level
								#TODO think about how to deal with different types of cards!
								"""
								else:
									title = None
									placeOfResidence = None
									nationality = None
									interviewSetting = None
									date = None
									description = None
									tags = None
									published = None

									#grab the segment title, placeOfResidence & date from the first card
									cards = [x for x in a['body'] if x['annotationType'] == 'metadata']
									if len(cards) > 0:
										for prop in cards[0]['properties']:
											if prop['key'] == 'title':
												title = prop['value']
											if prop['key'] == 'place of residence':
												placeOfResidence = prop['value']
											if prop['key'] == 'nationality':
												nationality = prop['value']
											if prop['key'] == 'interviewSetting':
												interviewSetting = prop['value']
											if prop['key'] == 'date':
												date = prop['value']
											if prop['key'] == 'description':
												description = prop['value']
											if prop['key'] == 'published':
												published = prop['value']

									#grab the segment tags
									classifications = [x for x in a['body'] if x['annotationType'] == 'classification']
									if len(classifications) > 0:
										tags = [x['label'] for x in classifications]

									if title:
										mediaObject['title'] = title
										mediaObject['title_raw'] = title
									if description:
										mediaObject['description'] = description
									if placeOfResidence:
										mediaObject['placeOfResidence'] = placeOfResidence
									if nationality:
										mediaObject['nationality'] = nationality
									if interviewSetting:
										mediaObject['interviewSetting'] = interviewSetting
									if date:
										try:
											datetime.strptime(date, '%m-%d-%Y')
										except ValueError, e:
											print e
											date = None
										mediaObject['date'] = date
									if tags:
										mediaObject['tags'] = tags
										mediaObject['tags_raw'] = tags
									if published:
										mediaObject['published'] = published
								"""
		return mediaObject, segments

	def __getCardPropertyValue(self, card, propertyName, multiField = False):
		value = None
		if 'properties' in card:
			for prop in card['properties']:
				if prop['key'] == propertyName:
					if multiField:
						value = prop['value'].split(';')
					else:
						value = prop['value']
					break
		return value

	def __indexResource(self, mediaObject, segments):
		#first index the man made segments
		if len(segments) > 0:
			print 'Holy crap there are segments? When did I annotate this?'
			segmentedMediaObject = copy.deepcopy(mediaObject)
			segmentedMediaObject['body'] = {
				'type': 'topic',
				'value' : segments
			}
			self.es.index(
				index=self.SEG_INDEX_NAME,
				doc_type=self.SEG_DOC_TYPE,
				body=segmentedMediaObject,
				id=uuid.uuid4()
			)

		#index the media object in a separate index (a.k.a. the collection index)
		self.es.index(
			index=self.INDEX_NAME,
			doc_type=self.DOC_TYPE,
			body=mediaObject,
			id=mediaObject['resourceId']
		)

	def __existsInIndex(self, indexId = '74eeadfe6910ce6e39fcf9980de34248ac53989e'):
		try:
			resp = self.es.get(self.INDEX_NAME, indexId)
			print resp
		except NotFoundError, e:
			return False
		return True

	#transforms a https://vimeo.com/{ID} URL into a player URL: http://player.vimeo.com/video/{ID}
	def __transposeVideoURL(self, url):
		if url.find('https://vimeo.com/') == -1:
			return url
		return 'http://player.vimeo.com/video/%s' % (
			url[len('https://vimeo.com/'):]
		)

	def __getVideoID(self, url):
		if url.find('/') == -1:
			return None
		return url[url.rfind('/') + 1:]

	"""not used right now
	def __getVideoMetadataFromIndex(self, videoURL):
		metadata = None
		print 'looking for: %s' % videoURL
		query = {"query":{"bool":{"must":[
			{
				"term":{"playableContent.url":"%s" % videoURL}}
			],
			"must_not":[],"should":[]}},"from":0,"size":10,"sort":[],"aggs":{}}
		resp = self.es.search(index=self.INDEX_NAME, doc_type=self.DOC_TYPE, body=query)
		#print json.dumps(resp, indent=4)
		if 'hits' in resp and resp['hits']['total'] == 1:
			if 'title' in resp['hits']['hits'][0]['_source']:
				thumbnails = resp['hits']['hits'][0]['_source']['thumbnails']
				metadata = {
					'title' : resp['hits']['hits'][0]['_source']['title'],
					'url' : videoURL,
					'images' : {}
				}
				if thumbnails:
					if len(thumbnails) > 2:
						metadata['images']['timeline'] = thumbnails[2]['link']
					if len(thumbnails) > 3:
						metadata['images']['sidebar'] = thumbnails[3]['link']
						if len(thumbnails) == 4:
							metadata['images']['poster'] = thumbnails[3]['link']
					if len(thumbnails) == 5:
						metadata['images']['poster'] = thumbnails[4]['link']
					if len(thumbnails) == 6:
						metadata['images']['poster'] = thumbnails[5]['link']
	        	else:
	        		'No thumbnails found for: %s' % videoURL
		return metadata

	def __getVimeoVideos(self):
		url = 'https://api.vimeo.com/oauth/authorize/client'
		headers = {'Authorization' : 'basic ' + base64.b64encode(self.config['CLIENT_ID'] + ":" + self.config['CLIENT_SECRET'])}
		resp = requests.post(url, headers=headers, data={'grant_type' : 'client_credentials'})
		print resp.text
		if resp.status_code == 200:
			#{"access_token":"df66ae4416e0e30a4a0c50d8ebeb090c","token_type":"bearer","scope":"public","app":{"name":"ArtTube Connect Annotator","uri":"/apps/97565"}}

			credentials = json.loads(resp.text)
			print 'Got credentials'
			print credentials
			if 'access_token' in credentials and 'app' in credentials:
				print 'got all the info I need'
				url = 'https://api.vimeo.com/users/arttubevideo/videos' #% credentials['app']['uri']
				print url
				headers = {
					'Authorization' : 'Bearer %s' % credentials['access_token']
					#'Accept': 'application/vnd.vimeo.*+json;version=3.2'
				}
				resp = requests.get(url, headers=headers)
				print resp
				print resp.text
				if resp and resp.status_code == 200:

					print resp.text

		print 'done'
	"""