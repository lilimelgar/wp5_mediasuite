//NOTE: make sure to import TimeUtil.js

var query2 = {
	filter: {
		term: {
			'bg:genres.bg:genre.raw': "praatprogramma"
		}
	},
	query: {
		bool: {
			should: [
				{
					simple_query_string: {
						query: "amsterdam",
						fields: [
							"_all"
						]
					}
				},
				{
					multi_match: {
						query: "amsterdam",
						type: "phrase_prefix",
						fields: [
							"bg:maintitles.bg:title",
							"bga:series.bg:maintitles.bg:title",
							"bg:publications.bg:publication.bg:broadcasters.bg:broadcaster",
							"bg:summary",
							"bg:description"
						]
					}
				}
			]
		}
	},
	aggs: {
		sortdate: {
			filter: {
				term: {
					'bg:genres.bg:genre.raw': "praatprogramma"
				}
			},
			aggs: {
				sortdate: {
					range: TimeUtil.generateYearAggregation("bg:publications.bg:publication.bg:sortdate", 1910, 2010)
				}
			}
		},
		'bg:publications.bg:publication.bg:broadcasters.bg:broadcaster.raw4': {
			filter: {
				term: {
					'bg:genres.bg:genre.raw': "praatprogramma"
				}
			},
			aggs: {
				'bg:publications.bg:publication.bg:broadcasters.bg:broadcaster.raw': {
					terms: {
						field: "bg:publications.bg:publication.bg:broadcasters.bg:broadcaster.raw",
						size: 10
					}
				},
				'bg:publications.bg:publication.bg:broadcasters.bg:broadcaster.raw_count': {
					cardinality: {
						field: "bg:publications.bg:publication.bg:broadcasters.bg:broadcaster.raw"
					}
				}
			}
		},
		'bg:genres.bg:genre.raw5': {
			filter: {
				term: {
					'bg:genres.bg:genre.raw': "praatprogramma"
				}
			},
			aggs: {
				'bg:genres.bg:genre.raw': {
					terms: {
						field: "bg:genres.bg:genre.raw",
						size: 10
					}
				},
				'bg:genres.bg:genre.raw_count': {
					cardinality: {
						field: "bg:genres.bg:genre.raw"
					}
				}
			}
		},
		'bg:keywords.bg:keyword.raw6': {
			filter: {
				term: {
					'bg:genres.bg:genre.raw': "praatprogramma"
				}
			},
			aggs: {
				'bg:keywords.bg:keyword.raw': {
					terms: {
						field: "bg:keywords.bg:keyword.raw",
						size: 10
					}
				},
				'bg:keywords.bg:keyword.raw_count': {
					cardinality: {
						field: "bg:keywords.bg:keyword.raw"
					}
				}
			}
		},
		no_filters_top_hits: {
			top_hits: {
				_source: false,
				size: 1
			}
		}
	},
	size: 10
}