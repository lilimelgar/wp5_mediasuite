from datetime import datetime

class TimeUtil:

	@staticmethod
	def SRTTimetoMillis(t):
		x = datetime.strptime(t, '%H:%M:%S,%f')
		return ((x.hour * 3600 + x.minute * 60 + x.second) * 1000) + int(str(x.microsecond)[0:3])

	@staticmethod
	def TranscriptTimetoMillis(t):
		x = datetime.strptime(t, '%H:%M:%S.%f')
		return ((x.hour * 3600 + x.minute * 60 + x.second) * 1000) + int(str(x.microsecond)[0:3])

	@staticmethod
	def toTimeString(secs):
		h = 0
		m = 0
		while secs >= 3600:
			h += 1
			secs -= 3600
		while secs >= 60:
			m += 1
			secs -= 60
		if h <= 9:
			h = '0%s' % h
		if m <= 9:
			m = '0%s' % m
		if secs <= 9:
			secs = '0%s' % secs
		return '%s:%s:%s' % (h, m, secs)

	#use this before chunking, the duration from VizRT is in the ss.ms format (e.g. 114.440)
	@staticmethod
	def formatSeconds(secs):
		if secs.find('.') == -1:
			return int(secs)
		else:
			return int(secs[0:secs.find('.')])

	@staticmethod
	def secsToMillis(sec):
		if sec.find(".") == -1:
			return int(sec) * 1000
		else:
			i = sec.find('.')
			return (int(sec[0: i]) * 1000) + int(sec[i + 1:])