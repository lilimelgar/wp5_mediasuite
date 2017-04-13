from elasticsearch import Elasticsearch
from elasticsearch.exceptions import ConnectionError
import copy

"""
This class should be able to provide the following data for ASR files

metadata : {
	video_data: {
		start: 72474960
		dragernummer: NOS_JOURNAAL_-WON00756598
		end: 72615960
	}
	dmguid: 2011121321201500800790450790017A43C92F00000008524B00000D0F006595
	mp3: 2011121321201500800790450790017A43C92F00000008524B00000D0F006595_655000_141000.mp3
	broadcast_date: 13-12-2011
	title: Reorganisatie bij bouwbedrijf Groothuis als gevolg van economische crisis. Kruisgesprek met politiek redacteur Dominique van der Heyde
}
"""

class Catalogue():

	def __init__(self, config):
		print config
		self.config = config
		self.es = Elasticsearch(
			host=self.config['CATALOGUE_ES_HOST'],
			port=self.config['CATALOGUE_ES_PORT']
		)
		try:
			print 'Trying to connect to the B&G catalogue'
			print self.es.info()
		except ConnectionError, e:
			print e

	def getFullMetadata(self, asrFile):
		metadata = {}
		guci = None
		dmguid = None
		start = -1
		end = -1
		duration = -1
		POMSID = None

		#extract a much info from the file name as possible to generate a good query in the next step
		fileInfo = self.__extractMetadataFromFileName(asrFile)
		if fileInfo['guci']:
			metadata['guci'] = fileInfo['guci']
		if fileInfo['dmguid']:
			metadata['dmguid'] = fileInfo['dmguid']
		if fileInfo['POMSID']:
			metadata['POMSID'] = fileInfo['POMSID']

		#generate a fitting query
		query = self.__getQuery(fileInfo)

		if query:
			response = self.es.search(
				index=self.config['CATALOGUE_INDEX'],
				doc_type=self.config['CATALOGUE_DOC_TYPE'],
				body=query
			)

			#first get the broadcast date from the results
			if response['hits']['total'] > 0:
				hit = response['hits']['hits'][0]['_source']
				metadata = copy.deepcopy(response['hits']['hits'][0]['_source'])
				resourceId = response['hits']['hits'][0]['_id']
				sortDate =  self.__getNewestSortDate(hit)
				#add the mandatory fields for the media suite (UI)
				if sortDate:
					metadata['resourceId'] = resourceId
					metadata['date'] = sortDate#TODO change this to date

					title = self.__getTitle(hit)
					if title:
						metadata['title'] = title
						metadata['title_raw'] = title

					description = self.__getDescription(hit)
					if description:
						metadata['description'] = description

					#get the relevant carrier
					mediaFragment = self.__getMediaFragmentInfo(hit)
					if mediaFragment:
						metadata['mediafile'] = mediaFragment
						isRadio = self.__isRadioContent(hit)
						if isRadio and 'bg:dmguid' in mediaFragment:
							pc = {
								'url' : '%s/%s' % (self.config['BASE_AUDIO_URL'], mediaFragment['bg:dmguid']),
								'assetId' : mediaFragment['bg:dmguid'], #for now let's use this as a reference to the media content
								'mimeType' : 'audio/mp3' #for now it's safe to assume it's mp3
							}
							if 'bg:startoncarrier' in mediaFragment:
								pc['start'] = mediaFragment['bg:startoncarrier']

							metadata['playableContent'] = [pc]
						elif not isRadio and 'bg:carrierreference' in mediaFragment:
							pc = {
								'url' : '%s/%s' % (self.config['BASE_VIDEO_URL'], mediaFragment['bg:carrierreference']),
								'assetId' : mediaFragment['bg:carrierreference'], #for now let's use this as a reference to the media content
								'mimeType' : 'video/mp4' #for now it's safe to assume it's mp3
							}
							if 'bg:startoncarrier' in mediaFragment and 'bg:startoffset' in mediaFragment:
								pc['start'] = int(mediaFragment['bg:startoncarrier']) - int(mediaFragment['bg:startoffset'])

							metadata['playableContent'] = [pc]

		else:
			print '\tCould not generate a useful query based on this file name: %s' % asrFile

		return metadata

	def __getQuery(self, fileInfo):
		query = None
		allSearchTerm = None
		if fileInfo['guci']:
			allSearchTerm = fileInfo['guci']
		if fileInfo['dmguid']:
			allSearchTerm = fileInfo['dmguid']
		if allSearchTerm:
			query = {
				"query":{"bool":{"must":[
					{"query_string":{
						"default_field" : "_all",
						"query" : "\"%s\"" % allSearchTerm}
					}
				],
				"must_not":[],"should":[]}},"from":0,"size":10,"sort":[],"aggs":{},
				"_source": {
					"exclude": [ "bg:transcripts" ]
    			}
			}
		return query

	def __extractPluralFieldList(self, data, field, field2 = None):
		items = []
		if data.has_key('%ss' % field) and data['%ss' % field].has_key(field):
			value = data['%ss' % field][field]
			if type(value) == list: # contains a list of objects
				for c in value:
					if field2: #further analyze the contained object
						items.extend(self.__extractPluralFieldList(c, field2))
					else: # add each object
						items.append(c)
			elif type(value) == dict: # contains just one object
				c = value
				if field2:
					items.extend(self.__extractPluralFieldList(c, field2))
				else: #add the object
					items.append(c)
			else: #add the string
				if value.find('; ') != -1:
					temp = value.split('; ')
					for t in temp:
						items.append(t.lstrip())
				else:
					items.append(value)
		return items

	def __isRadioContent(self, hit):
		if 'bga:series' in hit:
			if 'bg:distributionchannel' in hit['bga:series']:
				if hit['bga:series']['bg:distributionchannel'].lower() == 'radio':
					return True
		return False


	def __getTitle(self, hit):
		title = None
		if 'bg:maintitles' in hit and 'bg:title' in hit['bg:maintitles']:
			title = hit['bg:maintitles']['bg:title'][0]
		elif 'bga:series' in hit:
			return self.__getTitle(hit['bga:series'])
		elif 'bga:season' in hit:
			return self.__getTitle(hit['bga:season'])
		return title

	def __getDescription(self, hit):
		description = None
		if 'bg:summary' in hit:
			description = hit['bg:summary']
		return description


	def __getNewestSortDate(self, hit):
		pubs = self.__extractPluralFieldList(hit, 'bg:publication')
		sd = 0
		temp = 0
		sortDate = None
		if len(pubs) > 0:
			for p in pubs:
				if p.has_key('bg:sortdate'):
					try:
						temp = int(p['bg:sortdate'][6:])
					except Exception, e:
						print p['bg:sortdate'][6:]
						print e
					if temp > sd:#find the newest date
						sd = temp
						sortDate = p['bg:sortdate']
		return sortDate

	def __getMediaFragmentInfo(self, hit):
		carriers = self.__extractPluralFieldList(hit, 'bg:carrier')
		carrier = {}
		if len(carriers) > 0:
			for c in carriers:
				if c.has_key('bg:carriertype'):
					if c['bg:carriertype'] == 'media archive':
						carrier = c
						break
		return carrier

	"""
	Ander Nieuws (dmguid + start + duration; dragernr + start + end):
		20131024225830008007904507980C16E66DA380000004784B00000D0F062245_213400_444680.xml
		NOS_JOURNAAL_-WON01317768_72301840_72441320.xml

	Marathoninterviews (map with mapping-woordnl-asr.json):
		557.39810251.asr1.hyp
		556.het_marathoninterview_2008_25_december_2007_uur_2.asr1.hyp

	B&G oral history (dragernr):
		ORAL_HISTORY_-AEN556582YN.xml

	Open Beelden (? + dragernr; dragernr; dragernr + ?; ? + dragernr + start + end):
		51331.WEEKNUMMER630-HRE00012F49.xml
		51256.BG_18797.xml
		46379.Eco-conn-1024.xml
		BG_10319.xml
		BG_10319-512.xml
		29725.WEEKNUMMER312-HRE0001C8FA_430480_646640.xml

	Radio 1 (dragernr):
		2008100209RA1-RCR0810020X.xml

	Tony van Ver (dragernr):
		TONY_VAN_VERR-AEN553630OL.xml

	Andere:
		24682.WEEKNUMMER460-HRE000139E5_2138760_2205240.mp4.xml
	"""
	def __extractMetadataFromFileName(self, fileName):
		print fileName
		#possible variables to be found in the file name
		guci = None
		dmguid = None
		start = -1
		end = -1
		duration = -1
		POMSID = None

		#first strip off the extension and check if it's a valid ASR file name
		t, extension = self.__stripExtension(fileName)
		if not t:
			print 'cound not find a valid extension'
			return None

		#then strip off any bits before a leading '.'
		if t.find('.') != -1:
			t = t[t.find('.') + 1:]


		if len(t) == 64: #check if it has a DMGUID with optionally: start + duration
			dmguid = t
		elif len(t) > 64 and t[64:].find('_') != -1:
			dmguid = t[0:64]
			arr = t[65:].split('_')
			if len(arr) == 2:
				start = int(arr[0])
				duration = int(arr[1])
		elif len(t) == 25: #check if it has a GUCI with optionally: start + end
			guci = t
		elif len(t) > 25 and t[25:].find('_') != -1 and extension == 'xml':
			guci = t[0:25]
			arr = t[26:].split('_')
			if len(arr) == 2:
				start = int(arr[0])
				end = int(arr[1])
		elif len(t) < 25 and extension == 'xml': #gamble that it is a guci
			guci = t
		elif extension == 'hyp': #it's probably a woordnl file
			POMSID = t
		else:
			print 'I did not take this situation into account?'

		return {
			'guci': guci,
			'dmguid' : dmguid,
			'start' : start,
			'end' : end,
			'duration' : duration,
			'POMSID' : POMSID
		}

	def __stripExtension(self, fileName):
		if fileName.find('.mp4.xml') != -1:
			return fileName[:-8], 'xml'
		if fileName.find('.xml') != -1:
			return fileName[:-4], 'xml'
		if fileName.find('.asr1.hyp') != -1:
			return fileName[:-9], 'hyp'
		if fileName.find('.hyp') != -1:
			return fileName[:-4], 'hyp'
		return None, None

if __name__ == '__main__':
	c = Catalogue({
		'CATALOGUE_ES_HOST' : 'localhost',
		'CATALOGUE_ES_PORT' : 9210,
		'CATALOGUE_INDEX' : 'nisv-catalogue-aggr',
		'CATALOGUE_DOC_TYPE' : 'program_aggr'
	})
	print c.getMetadata('20131024225830008007904507980C16E66DA380000004784B00000D0F062245_213400_444680.xml')
	print c.getMetadata('NOS_JOURNAAL_-WON01317768_72301840_72441320.xml')
	print c.getMetadata('557.39810251.asr1.hyp')
	print c.getMetadata('556.het_marathoninterview_2008_25_december_2007_uur_2.asr1.hyp')
	print c.getMetadata('ORAL_HISTORY_-AEN556582YN.xml')
	print c.getMetadata('51331.WEEKNUMMER630-HRE00012F49.xml')
	print c.getMetadata('51256.BG_18797.xml')
	print c.getMetadata('46379.Eco-conn-1024.xml')
	print c.getMetadata('BG_10319.xml')
	print c.getMetadata('BG_10319-512.xml')
	print c.getMetadata('29725.WEEKNUMMER312-HRE0001C8FA_430480_646640.xml')
	print c.getMetadata('2008100209RA1-RCR0810020X.xml')
	print c.getMetadata('TONY_VAN_VERR-AEN553630OL.xml')
