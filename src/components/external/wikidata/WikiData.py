import requests, time, math
import WDUtil

API_ENDPOINT = 'https://www.wikidata.org/w/api.php';
WD_QUERY_API = 'https://wdq.wmflabs.org/api'
DEFAULT_PROPS = ('info', 'labels', 'descriptions', 'datatype', 'claims', 'aliases', 'sitelinks')

#Mostly copied from Hay's Chantek: https://github.com/hay/chantek

class WikiData():

	def __init__(self):
		print '--initializing WikiData--'
		self.entitycache = {}
		self.flattenlanguages = True

	"""
	-------------------- MAIN API CALLS --------------------
	"""

	#this expects a simple query
	def search(self, params):
		lang = 'nl'
		if params.has_key('language'):
			lang = params['language']
		r = WDUtil.apirequest(API_ENDPOINT, {
			"action" : "wbsearchentities",
			"format" : "json",
			"language" : lang,
			"type" : "item",
			"search" : params["q"]
		})
		if "success" in r:
			return r["search"]
		else:
			return False

	#this expects a bunch of wikidata ids (e.g Q34 or whatever)
	def get_entity(self, params):
		self.languages = params["languages"]
		self.ids = params["ids"]
		self.get_references = params["get_references"]
		self.props = params["props"]
		self.flattenlanguages = params.get("flattenlanguages") or True

		# For benchmarking purposes
		now = time.time()

		# We need this ugly hack for requests with more than 50 ids
		entities = {}

		if isinstance(self.ids, dict):
			ids = self.ids.keys()
		else:
			ids = self.ids

		reqcount = int(math.ceil(len(ids) / 50.0))

		for reqiterator in range(reqcount):
			idstart = reqiterator * 50
			idend = (reqiterator + 1) * 50
			ids_to_get = ids[idstart:idend]
			req = self.entity_request(ids_to_get)
			entities.update(req)


		for id_, entity in entities.items():
			entities[id_] = self.format(entities[id_])

		return entities

	#This expects a wikidata query (see: https://wdq.wmflabs.org/api_documentation.html)
	def query(self, params):
		r = WDUtil.apirequest(WD_QUERY_API, {
			"q" : params["q"]
		})

		status = r["status"]

		print r

		if r["status"]["error"] == "OK":
			frm, to = int(params["from"]), int(params["from"]) + int(params["size"])
			items = r["items"][frm:to]
			if params["resolvedata"] != False:
				ids = ",".join(map(str, items))

				entities = self.entity({
					"q" : ids,
					"language" : params["language"]
				})

				return entities
			else:
				return items
		else:
			return False

	"""
	-------------------- ALL KINDS OF FORMATTING FUNCTIONS --------------------
	"""

	def get_claim_values(self, claim):
		snak = claim["mainsnak"]

		if "datatype" not in snak:
			return claim

		datatype = snak["datatype"]
		val = { "datatype" : datatype }
		value = snak["datavalue"]["value"]

		if datatype == "wikibase-item":
			qid = "Q" + str(value["numeric-id"])
			val["value"] = qid
			self.entitycache[qid] = False
		elif datatype == "monolingualtext":
			# Probably a bit hacky really
			val["value"] = value["text"]
		else:
			val["value"] = value

		return val

	def get_claimvaluestring(self, val):
		datatype = val.get("datatype", None)
		value = val.get("value", False)

		if not value or not datatype:
			return ""

		if datatype == "wikibase-item":
			return val.get("value_labels", "")

		if datatype in ["string", "monolingualtext", "url"]:
			return value

		if datatype == "time":
			# HACK: This is really, pretty ugly
			# See < https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar >
			return value["time"][1:].lstrip("0")

		if datatype == "commonsMedia":
			return WDUtil.imagepage(value)

		if datatype == "globe-coordinate":
			return "%s,%s" % (value["latitude"], value["longitude"])

		if datatype == "quantity":
			return str(float(value.get("amount", "")))

		return ""

	def add_claimvaluestrings(self, claims):
		""" This basically does nothing more than adding a string-safe representation
		of every claim value"""
		for claim in claims:
			if "values" not in claim:
				continue

			for val in claim["values"]:
				val["value_string"] = self.get_claimvaluestring(val)

		return claims

	def get_claims(self, clist):
		"""
		This is a two-set process, because we don't know the labels of the
		properties and claims, we use the id's only the first time, then
		get the labels for all of these ids using a second query
		"""

		claims = []

		for (prop, claimlist) in clist.iteritems():
			values = map(self.get_claim_values, claimlist)
			self.entitycache[prop] = False # cache for query later

			claims.append({
				"property_id" : prop,
				"values" : values
			})

		# For the entitycache we don't get any entites, otherwise we'll end
		# in an endless loop
		if not self.get_entity:
			return claims

		self.entitycache = self.get_entity({
			"ids" : self.entitycache,
			"languages" : self.languages,
			"props" : ("labels", "descriptions"),
			"get_references" : False # That's pretty important, otherwise we'll get an endless loop
		})

		# Loop over the newly gotten entities and re-fill those values in claims
		for claim in claims:
			if claim["property_id"] not in self.entitycache:
				continue

			propinfo = self.entitycache[claim["property_id"]]

			if "descriptions" in propinfo:
				claim["property_descriptions"] = propinfo["descriptions"]

			if "labels" in propinfo:
				claim["property_labels"] = propinfo["labels"]

			for val in claim["values"]:
				if "datatype" not in val:
					continue

				if val["datatype"] != "wikibase-item":
					continue

				if val["value"] not in self.entitycache:
					continue

				valinfo = self.entitycache[val["value"]]

				if "descriptions" in valinfo:
					val["value_descriptions"] = valinfo["descriptions"]

				if "labels" in valinfo:
					val["value_labels"] = valinfo["labels"]

		# Sort by property ID, usually the lower numbers are more imporant
		claims.sort(key = lambda c:int(c['property_id'][1:]))

		claims = self.add_claimvaluestrings(claims)

		return claims

	def get_aliases(self, aliases):
		for (key, val) in aliases.iteritems():
			aliases[key] = map(lambda i:i["value"], val)

		return aliases

	def get_sitelinks(self, sitelinks):
		links = {}

		for (key, val) in sitelinks.iteritems():
			lang = val["site"].replace("wiki", "")
			title = val["title"]

			if lang not in self.languages:
				continue

			if lang == "commons":
				url = "http://commons.wikimedia.org/wiki/" + title
			else:
				url = "http://%s.wikipedia.org/wiki/%s" % (lang, title)

			links[lang] = {
				"title" : title,
				"url" : url
			}

		return links

	def flatten(self, item):
		lang = self.languages[0]

		for key in ("descriptions", "labels", "aliases"):
			if key in item:
				item[key] = item[key].get(lang, None)

		if "claims" not in item:
			return item

		for index, claim in enumerate(item["claims"]):
			for key in ("property_labels", "property_descriptions"):
				if key in item["claims"][index]:
					if type(item["claims"][index][key]) is list:
						item["claims"][index][key] = item["claims"][index][key][lang]

			for value in claim["values"]:
				for key in ("value_descriptions", "value_labels"):
					if key in item["claims"][index]["values"]:
						if type(item["claims"][index]["values"][key]) is list:
							item["claims"][index]["values"][key] = item["claims"][index]["values"][key][lang]

		return item

	def format(self, d):
		item = {
			"id" : d["id"]
		}

		if "aliases" in self.props and "aliases" in d:
			item["aliases"] = self.get_aliases(d["aliases"])

		if "claims" in self.props and "claims" in d:
			item["claims"] = self.get_claims(d["claims"])

		if "descriptions" in self.props and "descriptions" in d:
			item["descriptions"] = WDUtil.mapobj(d["descriptions"], lambda i:i["value"])

		if "labels" in self.props and "labels" in d:
			item["labels"] = WDUtil.mapobj(d["labels"], lambda i:i["value"])

		if "sitelinks" in self.props and "sitelinks" in d:
			item["sitelinks"] = self.get_sitelinks(d["sitelinks"])

		if len(self.languages) == 1 and self.flattenlanguages:
			item = self.flatten(item)

		return item

	def resolve_images(self, entities, width):
		for imagevalues, entity, property_id in self.iterimages(entities):
			filename = imagevalues["value"]

			image = {
				"full" : wmcommons.imageresize(filename),
				"thumb" : wmcommons.imageresize(filename, width)
			}

			imagevalues["image"] = image

			if property_id == "P18":
				entity["image"] = image

		return entities

	def entity_request(self, ids):
		r = WDUtil.apirequest(API_ENDPOINT, {
			"languages" : "|".join(self.languages),
			"action" : "wbgetentities",
			"ids" : "|".join(ids),
			"props" : "|".join(self.props),
			"languagefallback" : 1,
			"format" : "json"
		})

		if "success" in r:
			return r["entities"]
		else:
			raise Exception("Invalid or bad API request")

	def entity(self, args):
		# Parse the query
		q = args["q"]

		# Convert to a list, prepended with a q if needed
		q = [ qid if qid[0] == "Q" else "Q" + qid for qid in q.split(",") ]

		props = args.get("props", DEFAULT_PROPS)

		entity = self.get_entity({
			"ids" : q,
			"languages" : args["language"].split(","), # note that 'language' is not plural here
			"props" : props,
			"get_references" : True,
			"flattenlanguages" : args.get("flattenlanguages") or True
		})

		if args.get("resolveimages", False):
			entity = self.resolve_images(entity, args["imagewidth"])

		return entity

if __name__ == '__main__':
	print 'debugging the WikiData class'
	wd = WikiData()
	"""
	x = wd.get_entity({
		'languages' : ['nl'],
		'ids' : ['Q95'],
		'props' : DEFAULT_PROPS,
		'get_references' : False
	})
	"""


	x = wd.search({
		'q' : 'Amsterdam',
		'language' : 'nl'
	})


	"""
	x = wd.query({
		'q' : 'tree[30][150][17,131]',
		'resolvedata' : True,
		'language' : 'nl',
		'from' : 0,
		'size' : 40
	})
	"""
	print x
