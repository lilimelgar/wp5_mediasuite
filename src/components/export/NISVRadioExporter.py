#coding: utf8
import uuid
import os
import copy
import json

from elasticsearch import Elasticsearch
from elasticsearch.exceptions import ConnectionError

from components.beng.Catalogue import Catalogue

from components.util.ElasticsearchUtil import ElasticsearchUtil
from components.util.ASRUtil import ASRUtil
from components.util.AnnotationUtil import AnnotationUtil

"""
TODO
- also make sure the indices based on manual annotations are added as well
- make sure it's possible to select a number of facets to be exported in each layer
- only title and date should be copied to layer indices otherwise


CORRUPTE TONY VAN VER RECORD (ES lust deze niet)

http://search.rdlabs.beeldengeluid.nl/api/v1/document/get_doc/nisv-catalogue-aggr/4306592@program

"MapperParsingException[failed to parse [bg:publications.bg:publication.bg:publication-annotation]];
nested: IllegalArgumentException[Invalid format: "Montagedatum: 16-08-1992"
"""

class NISVRadioExporter():

	def __init__(self, config):
		self.config = config
		self.es = Elasticsearch(
			host=config['ES_HOST'],
			port=config['ES_PORT']
		)

		self.catalogue = Catalogue(self.config)
		self.DOC_TYPE = 'episode'
		self.INDEX_NAME = 'nisv'

		self.ASR_DOC_TYPE = 'media_fragment'
		self.ASR_INDEX_NAME = 'nisv__asr'

	#the single public function that orchestrates everything
	def run(self, operation):
		if operation == 'ri':
			return self.__reindex()
		elif operation == 'ea':
			return self.__exportAnnotations()
		return None

	def __exportAnnotations(self):
		annotations = AnnotationUtil.getAnnotationsOfCollection(
			self.config['ANNOTATION_USER'],
			self.INDEX_NAME,
			self.config['ANNOTATION_API']
		)
		return annotations

	def __reindex(self, operation=None):
		try:
			self.es.info() #test the connection
		except ConnectionError, e:
			print e
			return False
		#contains the media objects
		ElasticsearchUtil.createIndex(
			self.es,
			self.INDEX_NAME,
			self.config['ES_SETTINGS_FILE'],
			self.config['ES_COLLECTION_MAPPING_FILE'],
			self.config['DELETE_OLD_INDICES']
		)
		#contains all of the ASR
		ElasticsearchUtil.createIndex(
			self.es,
			self.ASR_INDEX_NAME,
			self.config['ES_SETTINGS_FILE'],
			self.config['ES_ANNOTATION_MAPPING_FILE'],
			self.config['DELETE_OLD_INDICES']
		)
		count = 0
		for directory in os.listdir(self.config['BASE_DATA_DIR']):
			if not os.path.isdir(os.path.join(self.config['BASE_DATA_DIR'], directory)):
				continue

			print 'Indexing %s into %s and %s' % (directory, self.INDEX_NAME, self.ASR_INDEX_NAME)
			#create an index based on the asr directory
			ElasticsearchUtil.createIndex(
				self.es,
				'%s__asr__%s' % (self.INDEX_NAME, directory),
				self.config['ES_SETTINGS_FILE'],
				self.config['ES_ANNOTATION_MAPPING_FILE'],
				self.config['DELETE_OLD_INDICES']
			)
			for root, dirs, files in os.walk(os.path.join(self.config['BASE_DATA_DIR'], directory)):
				#only process sub directories if recursive is specified
				for f in files:
					if f.find('.xml') != -1 or f.find('.hyp') != -1:
						collectionMetadata = self.catalogue.getFullMetadata(f)
						if collectionMetadata and 'resourceId' in collectionMetadata:
							speechSegments = ASRUtil.extractSpeechFragments(os.path.join(root, f))
							if speechSegments:
								resourceId = f #TODO create a better resourceId, using Catalogue.__extractMetadataFromFileName()

								#first get te collection metadata of the media object

								collectionMetadata['collectionId'] = self.INDEX_NAME
								segmentAnnotations = []

								mediaObjectTargetUri = None
								if 'playableContent' in collectionMetadata and len(collectionMetadata['playableContent']) > 0:
									mediaObjectTargetUri = collectionMetadata['playableContent'][0]['url']

								print mediaObjectTargetUri

								if mediaObjectTargetUri:
									#get the annotations made on (fragments of) the media object by passing the uri of the media object
									mediaObjectAnnotations, segmentAnnotations = AnnotationUtil.getMediaObjectAnnotations(
										self.config['ANNOTATION_USER'], #this could/should be dynamic based on the current user?
										mediaObjectTargetUri,
										self.config['ANNOTATION_API']
									)

									#assemble the media object for indexing
									self.__mergeMediaObjectAnnotations(
										collectionMetadata,
										mediaObjectAnnotations
									)

								#then index the whole thing
								self.__indexResource(
									directory,
									collectionMetadata, #obtained from the nisv index, extracting the ID from the ASR filename
									segmentAnnotations, #derived from the annotation API (TODO)
									speechSegments #obtained from the ASR file
								)
								count += 1

						else:
							print 'No metadata found for %s' % f
		return {
			'message' : 'Processed %d resources' % count
		}

	def __mergeMediaObjectAnnotations(self, collectionMetadata, annotations):
		"""
		if 'resourceId' in collectionMetadata:
			print 'Found catalogue item: %s' % collectionMetadata['resourceId']
			#add the basic metadata
			mediaObject = {
				'collectionId' : self.INDEX_NAME,
				'resourceId' : collectionMetadata['resourceId'], #ID of the immix/DAAN record
				'posterURL' : None #so the UI knows to load a default image (ugly)
			}
			if 'title' in collectionMetadata:
				#print '\twith a title: %s' % collectionMetadata['title']
				mediaObject['title'] = collectionMetadata['title']
				mediaObject['title_raw'] = collectionMetadata['title']

			if 'mediafile' in collectionMetadata:
				#print '\t with a media file yo'
				carrier = collectionMetadata['mediafile']
				if 'bg:dmguid' in carrier:
					mediaObject['playableContent'] = [{
						'url' : '%s/%s' % (self.config['BASE_MEDIA_URL'], carrier['bg:dmguid']),
						'assetId' : carrier['bg:dmguid'], #for now let's use this as a reference to the media content
						'mimeType' : 'audio/mp3' #for now it's safe to assume it's mp3
					}]

			#print json.dumps(mediaObject, indent=4, sort_keys=True)

		#TODO add the man made annotations on the media object
		"""
		pass

	def __indexResource(self, asrDir, mediaObject, segments, speechSegments):
		#merge the relevant subtitles with the segments
		subs = []
		for sub in speechSegments:
			subs.append({ #for populating the separate SRT index only
				'sequenceNr' : sub.number,
				'annotationType' : 'srt',
				'fragmentURI' : '#t=%s,%s' % (sub.start, sub.end),
				'start' : sub.start,
				'end' : sub.end,
				'words' : sub.content,
				'wordTimes' : sub.times
			})

			#add the speech fragment to the man made segments
			for s in segments:
				if self.__overlapsFragment(sub.start, sub.end, s['start'], s['end']):
					s['words'] += sub.content

		#first index the man made segments
		if len(segments) > 0:
			print 'Holy crap there are segments? When did I annotate this?'
			segmentedMediaObject = copy.deepcopy(mediaObject)
			segmentedMediaObject['body'] = {
				'type': 'topic',
				'value' : segments
			}
			"""
			self.es.index(
				index=self.TOPIC_INDEX_NAME,
				doc_type=self.TOPIC_DOC_TYPE,
				body=segmentedMediaObject,
				id=uuid.uuid4()
			)
			"""

		#then the ASR main index and the current ASR index (based on the ASR directory name)
		if len(subs) > 0:
			segmentedMediaObject = copy.deepcopy(mediaObject)
			segmentedMediaObject['body'] = {
				'type': 'asr',
				'value' : subs
			}
			self.es.index(
				index=self.ASR_INDEX_NAME,
				doc_type=self.ASR_DOC_TYPE,
				body=segmentedMediaObject,
				id=uuid.uuid4()
			)
			self.es.index(
				index='%s__asr__%s' % (self.INDEX_NAME, asrDir),
				doc_type=self.ASR_DOC_TYPE,
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

	#test if e.g. an SRT line falls within the duration of a topic
	def __overlapsFragment(self, sourceStart, sourceEnd, targetStart, targetEnd):
		if sourceStart >= targetStart and sourceStart <= targetEnd:
			return True #the start falls within the boundaries of the fragment
		if sourceEnd >= targetStart and sourceEnd <= targetEnd:
			return True #the end falls within the boundaries of the fragment
		return False
