from components.export.MotUExporter import MotUExporter
from components.export.NISVRadioExporter import NISVRadioExporter
from components.export.ARTtubeConnectExporter import ARTtubeConnectExporter

class AnnotationExporter():

	def __init__(self, config):
		self.mapping = {}
		if 'motu' in config['EXPORT_CONFIGS']:
			self.mapping['motu'] = MotUExporter(config['EXPORT_CONFIGS']['motu'])
		if 'nisv' in config['EXPORT_CONFIGS']:
			self.mapping['nisv'] = NISVRadioExporter(config['EXPORT_CONFIGS']['nisv'])
		if 'arttube' in config['EXPORT_CONFIGS']:
			self.mapping['arttube'] = ARTtubeConnectExporter(config['EXPORT_CONFIGS']['arttube'])

	def execute(self, script, operation=None):
		return self.mapping[script].run(operation)

