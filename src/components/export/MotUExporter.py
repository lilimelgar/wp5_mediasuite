#coding: utf8
import uuid
import json
import os
import codecs
import copy
import requests

from datetime import datetime
from itertools import groupby
from collections import namedtuple
from elasticsearch import Elasticsearch, RequestsHttpConnection
from elasticsearch.exceptions import ConnectionError

#weird character: http://www.fileformat.info/info/unicode/char/feff/index.htm
#read about named tuples: https://pythontips.com/2015/06/06/why-should-you-use-namedtuple-instead-of-a-tuple/

from components.util.ElasticsearchUtil import ElasticsearchUtil
from components.util.AnnotationUtil import AnnotationUtil
from components.util.TimeUtil import TimeUtil

"""
The reasons for creating a separate index for annotations is that if you integrate it with the collection
indices and the mapping needs to be changed, the entire index needs te be recreated, which sucks...
"""

class MotUExporter():

	def __init__(self, config):
		self.config = config
		if 'ES_USER' in config and config['ES_USER'] and 'ES_PW' in config and config['ES_PW']:
			self.es = Elasticsearch(
				['%s:%s' % (self.config['ES_HOST'], self.config['ES_PORT'])],
				connection_class=RequestsHttpConnection,
				http_auth=(self.config['ES_USER'], self.config['ES_PW']),
				use_ssl=True,
				verify_certs=False
			)
		else: #make a connection the simple way
			self.es = Elasticsearch(
				host=config['ES_HOST'],
				port=config['ES_PORT']
			)
		self.ANNOTATION_USER = 'motu'
		self.DOC_TYPE = 'episode'
		self.INDEX_NAME = 'motu'

		self.SRT_DOC_TYPE = 'media_fragment'
		self.SRT_INDEX_NAME = 'motu__srt'

		self.TOPIC_DOC_TYPE = 'media_fragment'
		self.TOPIC_INDEX_NAME = 'motu__topics'

	def run(self, operation=None):
		if operation == 'ri':
			return self.__reindex()
		elif operation == 'ea':
			return self.__exportAnnotations()
		return None

	def __exportAnnotations(self):
		annotations = AnnotationUtil.getAnnotationsOfCollection(
			self.ANNOTATION_USER,
			self.INDEX_NAME,
			self.config['ANNOTATION_API']
		)
		return annotations

	def __reindex(self):
		#test the connection
		try:
			self.es.info()
		except ConnectionError, e:
			print e
			return None
		#this will always create new indices
		ElasticsearchUtil.createIndex(
			self.es,
			self.INDEX_NAME,
			self.config['ES_SETTINGS_FILE'],
			self.config['ES_COLLECTION_MAPPING_FILE'],
			self.config['DELETE_OLD_INDICES']
		)
		ElasticsearchUtil.createIndex(
			self.es,
			self.SRT_INDEX_NAME,
			self.config['ES_SETTINGS_FILE'],
			self.config['ES_ANNOTATION_MAPPING_FILE'],
			self.config['DELETE_OLD_INDICES']
		)
		ElasticsearchUtil.createIndex(
			self.es,
			self.TOPIC_INDEX_NAME,
			self.config['ES_SETTINGS_FILE'],
			self.config['ES_ANNOTATION_MAPPING_FILE'],
			self.config['DELETE_OLD_INDICES']
		)

		#TODO loop through the dir to index everything properly
		count = 0
		for root, dirs, files in os.walk('%s/transcripts' % self.config['BASE_DATA_DIR']):
			for d in dirs:
				if d:
					#only export mediaObjects with the key/value pair: published == 'yes'
					#if 'published' in mediaObject and mediaObject['published'] == 'yes':
					for rt, ds, fs in os.walk(os.path.join(root, d)):
						#if you have a main interview file, but no srt, creating a dir will have the main interview indexed
						if len(fs) == 0:
							resourceId = d
							scientistName = d.replace('_', ' ')
							mediaObject, segments = self.__generateIndexData('motu', resourceId, scientistName)
							self.__indexResource(
								mediaObject,
								segments,
								[]#empty list
							)
							count += 1
						for f in fs:
							#each SRT represents a separate interview with the same scientist
							if f.find('.srt') != -1:
								resourceId = f[0:f.rfind('.srt')]
								scientistName = d.replace('_', ' ')
								mediaObject, segments = self.__generateIndexData('motu', resourceId, scientistName)
								self.__indexResource(
									mediaObject,
									segments,
									self.__parseSRT(os.path.join(rt, f))
								)
								count += 1
		return {
			'message' : 'Processed %d interviews with scientists' % count
		}

	#provide resolvable file names (relative to this python script or absolute paths)
	def __parseSRTs(self, files):
		print files
		subs = []
		for f in files:
			subs.extend(self.__parseSRT(f))
		return subs

	def __parseSRT(self, fn):
		subs = []
		with codecs.open(fn, 'r', 'utf-8') as f:
			res = [list(g) for b,g in groupby(f, lambda x: bool(x.strip())) if b]

			Subtitle = namedtuple('Subtitle', 'number start end content')
			for sub in res:
				if len(sub) >= 3: # not strictly necessary, but better safe than sorry
					sub = [x.strip() for x in sub]
					number, start_end, content = sub
					start, end = start_end.split(' --> ')
					subs.append(Subtitle(
						number,
						TimeUtil.SRTTimetoMillis(start),
						TimeUtil.SRTTimetoMillis(end),
						content
					))
		return subs

	#test if e.g. an SRT line falls within the duration of a topic
	def __overlapsFragment(self, sourceStart, sourceEnd, targetStart, targetEnd):
		if sourceStart >= targetStart and sourceStart <= targetEnd:
			return True #the start falls within the boundaries of the fragment
		if sourceEnd >= targetStart and sourceEnd <= targetEnd:
			return True #the end falls within the boundaries of the fragment
		return False

	#TODO make sure to separate segments and media objects annotations
	def __generateIndexData(self, collectionId, resourceId, scientistName):
		print 'Generating from %s' % resourceId

		#first define the 'annotationless' media object. Add annotations on this object later
		mediaObject = {
			'collectionId' : collectionId,
			'resourceId' : resourceId, #directory name (firstname_lastname__location)
			'name' : scientistName,
			'title' : scientistName, #placeholder for the UI/search
			'title_raw' : scientistName, #placeholder for the UI/search
			'playableContent' : [{ #we assume the video has the same filename as the directory
				'url' : '%s/%s/mp4/%s.mp4' % (
					self.config['BASE_MEDIA_URL'],
					scientistName.replace(' ', '_'),
					resourceId
				),
				'assetId' : resourceId,
				'mimeType' : 'video/mp4'
			}],
			'posterURL' : self.__generatePosterURL(resourceId, scientistName.replace(' ', '_'))
		}

		segments = []
		targetUrl = '%s/%s/mp4/%s.mp4' % (self.config['BASE_MEDIA_URL'], scientistName.replace(' ', '_'), resourceId)
		url = '%s/api/annotations/filter?target.source=%s&user=motu' % (
			self.config['ANNOTATION_API'],
			targetUrl
		)
		resp = requests.get(url)
		if resp.status_code == 200:
			data = json.loads(resp.text)
			if data and 'annotations' in data:
				for a in data['annotations']:
					if 'body' in a and a['body']:
						#these are the segments
						if 'selector' in a['target'] and a['target']['selector']:
							title = None
							keyMoments = None
							tags = None
							start = float(a['target']['selector']['start']) * 1000
							end = float(a['target']['selector']['end']) * 1000

							#grab the segment title from the cards
							cards = [x for x in a['body'] if x['annotationType'] == 'metadata']
							if len(cards) > 0:
								title = self.__getCardPropertyValue(cards[0], 'title')
								keyMoments = self.__getCardPropertyValue(cards[0], 'key moments', True)

							#grab the segment tags
							classifications = [x for x in a['body'] if x['annotationType'] == 'classification']
							if len(classifications) > 0:
								tags = [x['label'] for x in classifications]

							segment = {
								'start' : start,
								'end' : end,
								'title' : title,
								'words' : ''
							}
							if keyMoments:
								segment['keyMoments'] = keyMoments
							if tags:
								segment['tags'] = tags
								segment['tags_raw'] = tags
							segments.append(segment)
						#these are the annotations made on the document level
						#TODO only use the first annotation!
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


	def __generatePosterURL(self, resourceId, scientistName):
		return '%s/%s/thumbnails/%s/%s_0030.jpg' % (
			self.config['BASE_MEDIA_URL'],
			scientistName,
			resourceId,
			resourceId
		)

	def __indexResource(self, mediaObject, segments, subtitles):
		#merge the relevant subtitles with the segments
		subs = []
		for sub in subtitles:
			subs.append({ #for populating the separate SRT index only
				'sequenceNr' : sub.number,
				'annotationType' : 'srt',
				'fragmentURI' : '#t=%s,%s' % (sub.start, sub.end),
				'start' : sub.start,
				'end' : sub.end,
				'words' : sub.content
			})
			for s in segments:
				if self.__overlapsFragment(sub.start, sub.end, s['start'], s['end']):
					s['words'] += sub.content

		#first index the segments
		if len(segments) > 0:
			segmentedMediaObject = copy.deepcopy(mediaObject)
			segmentedMediaObject['body'] = {
				'type': 'topic',
				'value' : segments
			}
			#Currently needed for the posterURL for the fragment, but I think it should be removed after changing MotUConfig.js
			segmentedMediaObject['target'] = {
				'url' : '%s/%s/mp4/%s.mp4' % (self.config['BASE_MEDIA_URL'], mediaObject['resourceId'], mediaObject['resourceId']),
				'assetId' : mediaObject['resourceId'],
				'mimeType' : 'video/mp4'
			}
			self.es.index(
				index=self.TOPIC_INDEX_NAME,
				doc_type=self.TOPIC_DOC_TYPE,
				body=segmentedMediaObject,
				id=uuid.uuid4()
			)

		#then the srt index
		if len(subs) > 0:
			segmentedMediaObject = copy.deepcopy(mediaObject)
			segmentedMediaObject['body'] = {
				'type': 'srt',
				'value' : subs
			}
			segmentedMediaObject['target'] = {
				'url' : '%s/%s/mp4/%s.mp4' % (self.config['BASE_MEDIA_URL'], mediaObject['resourceId'], mediaObject['resourceId']),
				'assetId' : mediaObject['resourceId'],
				'mimeType' : 'video/mp4'
			}
			self.es.index(
				index=self.SRT_INDEX_NAME,
				doc_type=self.SRT_DOC_TYPE,
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
