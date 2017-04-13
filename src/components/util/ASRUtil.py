import codecs
from collections import namedtuple

import lxml
from lxml import etree
from lxml import html

from components.util.TimeUtil import TimeUtil

class ASRUtil:

	@staticmethod
	def extractSpeechFragments(asrFile):
		print asrFile
		xmlElm = None
		fd = codecs.open(asrFile, 'r', 'latin-1')
		text = fd.read()
		#text = text.replace('<EOS-score="0.00000"/>', '')
		try:
			xmlElm = html.fromstring(text.encode('utf-8'))
		except lxml.etree.XMLSyntaxError, e:
			print 'Could not parse the XML in the ASR file %s' % asrFile
			print e
			return None

		speechFragments = []
		xpath_query = 'segments/speech'
		speechTags = xmlElm.xpath(xpath_query)
		if not speechTags:
			xpath_query = 'segments/speaker/speech'
			speechTags = xmlElm.xpath(xpath_query)

		if speechTags and len(speechTags) > 0:
			SpeechSegment = namedtuple('SpeechSegment', 'number start end content times')

			wordTimes = {}
			number = 1
			#go through all the speech segments
			for st in speechTags:
				asrChunk = u''
				chunkWordTimes = []
				speechBeginTime = int(float(st.attrib['begintime'])*1000)
				speechEndTime = int(float(st.attrib['endtime'])*1000)
				words = st.xpath('wordsequence/word')

				#go through all the words in each segment (a.k.a. "chunk")
				for word in words:
					wordID = unicode(ASRUtil.cleanText(word.attrib['wordid']))

					beginTime = unicode(word.attrib['begintime'])
					endTime = unicode(word.attrib['endtime'])
					bms = TimeUtil.secsToMillis(beginTime)
					ems = TimeUtil.secsToMillis(endTime)
					if wordID != '[s]' and wordID != 'SIL':
						asrChunk = '%s %s' % (asrChunk, wordID)
						chunkWordTimes.append((bms, ems))

					#collect the timecodes of the word occurences
					if wordID not in wordTimes:
						wordTimes[wordID] = [(bms, ems)]
					else:
						wordTimes[wordID].append((bms, ems))

				#finally prepare the index document (type=asr_chunk) and index it
				speechFragments.append(SpeechSegment(
					number, #mimick the line number in SRT files (useful in the UI)
					speechBeginTime, #same as SRT
					speechEndTime, #same as SRT
					asrChunk, #same as SRT
					chunkWordTimes #this is information that SRT does not have
				))
				number += 1

		return speechFragments

	@staticmethod
	def cleanText(text):
		text = text.replace('\n', '')
		text = text.replace("'", '')
		return text
