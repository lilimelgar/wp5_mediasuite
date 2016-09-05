import CollectionAPI from '../../api/CollectionAPI.js';
import CollectionStats from './CollectionStats.jsx';

class CollectionSelector extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			activeCollection: '',
			activeDocumentType: '',
			activeCollectionStats: null,
			activeDateField: null,
			activeAnalysisField: null
		}
		CollectionAPI.listCollections((collections) => {
			this.setState({collectionList :  collections});
		});
	}

	loadDocumentTypes(event) {
		let collectionId = event.target.value;
		this.setState(
			{activeCollection : collectionId},
			CollectionAPI.getCollectionStats(collectionId, (data) => {
				console.debug(data);
				this.setState(
					{
						activeCollectionStats : data,
						activeDocumentTypeStats : data.collection_statistics.document_types[0],
						activeDocumentType : data.collection_statistics.document_types[0].doc_type
					}
				);
			})
		)

	}

	setDocumentType() {
		this.setState({activeDocumentType : event.target.value});
	}

	/* ------------------------------------------------------------------------------
	------------------------------- COMMUNICATION WITH OWNER/RECIPE -----------------
	------------------------------------------------------------------------------- */

	onOutput(e) {
		e.preventDefault();
		if(this.props.onOutput) {
			let collectionId = this.state.activeCollection;
			this.props.onOutput(this.constructor.name, collectionId);
		}
	}

	render() {
		let collectionSelect = '';
		let documentTypeSelect = '';
		let collectionStats = '';
		if(this.state.collectionList) {

			//the collection selection part
			let collectionOptions = this.state.collectionList.map((collection) => {
				return (
					<option key={collection.collection + '__option'} value={collection.collection}>
						{collection.collection}
						&nbsp;
						({collection.doc_count})
					</option>
				)
			});
			collectionOptions.splice(0, 0, <option key="null__option" value="">Select a collection</option>);

			collectionSelect = (
				<fieldset className="form-group">
					<label>Select collection</label>
					<select className="form-control"
						value={this.state.activeCollection}
						onChange={this.loadDocumentTypes.bind(this)}>
						{collectionOptions}
					</select>
				</fieldset>
			);

			//the document type selection part
			if(this.state.activeCollectionStats) {
				let docTypeOptions = this.state.activeCollectionStats.collection_statistics.document_types.map((docType) => {
					return (
						<option key={docType.doc_type} value={docType.doc_type}>{docType.doc_type}</option>
					)
				});

				documentTypeSelect = (
					<fieldset className="form-group">
						<label>Select document type</label>
						<select className="form-control"
							value={this.state.activeDocType}
							onChange={this.setDocumentType.bind(this)}>
							{docTypeOptions}
						</select>
					</fieldset>
				);

				//draw the stats too TODO fix them!
				if(this.props.showStats) {
					collectionStats = (<CollectionStats data={this.state.activeCollectionStats}/>);
				}
			}

			return (
				<div className="row">
					<div className={this.props.showStats ? 'col-md-5' : 'col-md-12'}>
						<form key="collection_selector" onSubmit={this.onOutput.bind(this)}>
							{collectionSelect}
							{documentTypeSelect}
							<button className="btn btn-default">
								Select
							</button>
						</form>
					</div>
					<div className={this.props.showStats ? 'col-md-5' : 'hidden'}>
						{collectionStats}
					</div>
				</div>
			)
		} else {
			console.debug('Loading collection list');
			return (<h3 key="collection_list_loading">Loading collection list...</h3>)
		}
	}

};

export default CollectionSelector;
