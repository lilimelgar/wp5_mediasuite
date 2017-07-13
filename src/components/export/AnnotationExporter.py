from components.export.NISVRadioExporter import NISVRadioExporter

class AnnotationExporter():

	def __init__(self, config):
		self.mapping = {}
		if 'nisv' in config['EXPORT_CONFIGS']:
			self.mapping['nisv'] = NISVRadioExporter(config['EXPORT_CONFIGS']['nisv'])

	def execute(self, script, operation=None):
		return self.mapping[script].run(operation)

