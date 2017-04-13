import requests
import copy
import json

class AnnotationUtil:

	#Yikes the annotations don't have a collection ID yet... (instead the user identifies the collection :s)
	#TODO Also this now exports in the style needed for ArtTube! need to make it more generic
	@staticmethod
	def getAnnotationsOfCollection(userId, collectionId, annotationAPIUrl):
		annotations = {}
		url = '%s/api/annotations/filter?&user=%s' % (
			annotationAPIUrl,
			userId
		)
		resp = requests.get(url)
		if resp.status_code == 200:
			data = json.loads(resp.text)
			if data and 'annotations' in data:
				for a in data['annotations']:
					if 'body' in a and a['body']:
						#these are the av segments
						if 'selector' in a['target'] and a['target']['selector'] and 'start' in a['target']['selector']:
							segment = {}
							source = a['target']['source']
							start = float(a['target']['selector']['start']) * 1000
							end = float(a['target']['selector']['end']) * 1000

							#grab the segment title from the cards
							cards = [x for x in a['body'] if x['annotationType'] == 'metadata']
							if len(cards) > 0:
								for c in cards:
									#actually add the formatted segment to the temporary hash object
									template = 'generic'
									if 'annotationTemplate' in c:
										template = c['annotationTemplate']
									segment = {
										'annotationId': c['annotationId'],
										'annotationTemplate': template,
										'annotationType': c['annotationType'],
										'start' : start,
										'end' : end
									}
									if 'properties' in c:
										metadata = {}
										for p in c['properties']:
											metadata[p['key']] = p['value']
										segment['metadata'] = metadata
									if source in annotations:
										annotations[source].append(segment)
									else:
										annotations[source] = [segment]
						else:
							pass

		#sort the annotations per target
		for target in annotations:
			annotations[target].sort(key = lambda x: x['start'])

		return annotations

	@staticmethod
	def getMediaObjectAnnotations(userId, targetUri, annotationAPIUrl):
		print 'Getting annotations for:  %s' % targetUri
		mediaObjectAnnotations = {}
		segmentAnnotations = []
		url = '%s/api/annotations/filter?target.source=%s&user=%s' % (
			annotationAPIUrl,
			targetUri,
			userId
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
							tags = None
							start = float(a['target']['selector']['start']) * 1000
							end = float(a['target']['selector']['end']) * 1000

							#grab the segment title from the cards
							cards = [x for x in a['body'] if x['annotationType'] == 'metadata']
							if len(cards) > 0:
								title = [x for x in cards[0]['properties'] if x['key'] == 'title'][0]['value']

							#grab the segment tags
							classifications = [x for x in a['body'] if x['annotationType'] == 'classification']
							if len(classifications) > 0:
								tags = [x['label'] for x in classifications]

							#TODO voeg key moment toe als facet!
							segmentAnnotations.append({
								'start' : start,
								'end' : end,
								'title' : title,
								'words' : '',
								'tags' : tags,
								'tags_raw' : tags
							})
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
								mediaObjectAnnotations['title'] = title
								mediaObjectAnnotations['title_raw'] = title
							if description:
								mediaObjectAnnotations['description'] = description
							if placeOfResidence:
								mediaObjectAnnotations['placeOfResidence'] = placeOfResidence
							if nationality:
								mediaObjectAnnotations['nationality'] = nationality
							if interviewSetting:
								mediaObjectAnnotations['interviewSetting'] = interviewSetting
							if date:
								try:
									datetime.strptime(date, '%m-%d-%Y')
								except ValueError, e:
									print e
									date = None
								mediaObjectAnnotations['date'] = date
							if tags:
								mediaObjectAnnotations['tags'] = tags
								mediaObjectAnnotations['tags_raw'] = tags
							if published:
								mediaObjectAnnotations['published'] = published

		return mediaObjectAnnotations, segmentAnnotations
