import React from 'react';
import CommentingForm from './CommentingForm';
import ClassifyingForm from './ClassifyingForm';

class AnnotationCreator extends React.Component {

	constructor(props) {
		super(props);
		//make this less shitty verbosey
		let comment = '';
		let classifications = [];
		if(this.props.annotation) {
			if(this.props.annotation.data.classifications) {
				classifications = this.props.annotation.data.classifications;
			}
			if(this.props.annotation.data.comment) {
				comment = this.props.annotation.data.comment;
			}
		}
		this.state = {
			modes : this.props.annotationModes,
			activeTab : null,
			classifications : classifications,
			comment : comment
		}
	}

	updateAnnotationData(mode, value) {
		this.setState({[mode] : value});
	}

	gatherDataAndSave() {
		var annotation = this.props.annotation;
		if(!annotation) {
			annotation = {};
		}
		var data = {};
		if(this.state.classifications.length > 0) {
			data['classifications'] = this.state.classifications;
		}
		if(this.state.comment) {
			data['comment'] = this.state.comment
		}
		annotation.data = data;
		this.props.saveAnnotation(annotation);
	}

	render() {
		//generate the tabs from the configured modes
		const tabs = this.state.modes.map(function(mode) {
			return (
				<li
					key={mode.type + '__tab_option'}
					className={this.state.activeTab == mode.type ? 'active' : ''}
				>
					<a data-toggle="tab" href={'#' + mode.type}>
						{mode.type}
					</a>
				</li>
				)
		}, this)

		//generate the content of each tab (a form based on a annotation mode/motivation)
		var tabContents = this.state.modes.map(function(mode) {
			let form = '';
			switch(mode.type) {
				case 'comment' : form = (
					<CommentingForm
						data={this.state.comment}
						config={mode}
						updateAnnotationData={this.updateAnnotationData.bind(this)}
					/>
				);break;
				case 'classify' : form = (
					<ClassifyingForm
						data={this.state.classifications}
						config={mode}
						updateAnnotationData={this.updateAnnotationData.bind(this)}
					/>
				);break;
			}
			return (
				<div key={mode.type + '__tab_content'} id={mode.type} className={
					this.state.activeSearchTab == mode.type ? 'tab-pane active' : 'tab-pane'
				}>
					<h3>{mode.type}</h3>
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