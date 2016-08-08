import CommentingForm from './CommentingForm';
import ClassifyingForm from './ClassifyingForm';
import LinkingForm from './LinkingForm';

class AnnotationCreator extends React.Component {

	constructor(props) {
		super(props);
		//make this less shitty verbosey
		let comments = [];
		let classifications = [];
		let links = [];
		if(this.props.activeAnnotation) {
			if(this.props.activeAnnotation.data.classifications) {
				classifications = this.props.activeAnnotation.data.classifications;
			}
			if(this.props.activeAnnotation.data.comments) {
				comments = this.props.activeAnnotation.data.comments;
			}
			if(this.props.activeAnnotation.data.links) {
				links = this.props.activeAnnotation.data.links;
			}
		}
		let activeTab = null;
		for(let i=0;i<Object.keys(this.props.annotationModes).length;i++) {
			if(Object.keys(this.props.annotationModes)[i] != 'bookmark') {
				activeTab = Object.keys(this.props.annotationModes)[i];
				break;
			}
		}
		this.state = {
			activeTab : activeTab,
			classifications : classifications,
			comments : comments,
			links : links
		}
	}

	updateAnnotationData(mode, value) {
		this.setState({[mode] : value});
	}

	//TODO this function looks like it could be more optimized
	gatherDataAndSave() {
		var annotation = this.props.activeAnnotation;
		if(!annotation) {
			annotation = {
				user : this.props.user
			};
			if(this.props.playerAPI) {
				let activeSegment = this.props.playerAPI.getActiveSegment();
				if(activeSegment) {
					annotation.start = activeSegment.start;
					annotation.end = activeSegment.end;
				}
			}
		}
		var data = {};
		if(this.state.classifications.length > 0) {
			data['classifications'] = this.state.classifications;
		}
		if(this.state.comments.length > 0) {
			data['comments'] = this.state.comments
		}
		if(this.state.links.length > 0) {
			data['links'] = this.state.links
		}
		annotation.data = data;
		this.props.saveAnnotation(annotation);
	}

	render() {
		//generate the tabs from the configured modes
		const tabs = Object.keys(this.props.annotationModes).map(function(mode) {
			if(mode == 'bookmark') return null;
			return (
				<li
					key={mode + '__tab_option'}
					className={this.state.activeTab == mode ? 'active' : ''}
				>
					<a data-toggle="tab" href={'#' + mode}>
						{mode}
					</a>
				</li>
				)
		}, this)

		//generate the content of each tab (a form based on a annotation mode/motivation)
		var tabContents = Object.keys(this.props.annotationModes).map(function(mode) {
			if(mode == 'bookmark') return null;
			let form = '';
			switch(mode) {
				case 'comment' : form = (
					<CommentingForm
						data={
							this.props.activeAnnotation && this.props.activeAnnotation.data.comments ?
								this.props.activeAnnotation.data.comments : null
						}
						config={this.props.annotationModes[mode]}
						onOutput={this.updateAnnotationData.bind(this)}
					/>
				);break;
				case 'classify' : form = (
					<ClassifyingForm
						data={
							this.props.activeAnnotation && this.props.activeAnnotation.data.classifications ?
								this.props.activeAnnotation.data.classifications : null
						}
						config={this.props.annotationModes[mode]}
						onOutput={this.updateAnnotationData.bind(this)}
					/>
				);break;
				case 'link' : form = (
					<LinkingForm
						data={
							this.props.activeAnnotation && this.props.activeAnnotation.data.links ?
								this.props.activeAnnotation.data.links : null
						}
						config={this.props.annotationModes[mode]}
						onOutput={this.updateAnnotationData.bind(this)}
					/>
				);break;
			}
			return (
				<div
					key={mode + '__tab_content'}
					id={mode}
					className={this.state.activeTab == mode ? 'tab-pane active' : 'tab-pane'}>
						{form}
				</div>
				);
		}, this);

		return (
			<div>
				<ul className="nav nav-tabs">
					{tabs}
				</ul>
				<div className="tab-content">
					{tabContents}
				</div>
				<div className="text-right">
					<button
						type="button"
						className="btn btn-primary"
						onClick={this.gatherDataAndSave.bind(this)}>
						Save
					</button>
				</div>
			</div>
		)
	}
}

export default AnnotationCreator;