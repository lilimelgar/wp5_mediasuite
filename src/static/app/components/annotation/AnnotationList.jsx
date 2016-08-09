import React from 'react';
import Annotation from './Annotation.jsx';

//TODO zo maken dat dit component zelfstandig de annotaties ophaalt en
//hierbij per default alleen de annotaties van de huidige user en het huidige annotatie target laat zien

class AnnotationList extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		const annotations = this.props.annotations.map(function(annotation) {
			let active = false;
			if(this.props.activeAnnotation) {
				active = this.props.activeAnnotation.id === annotation.id
			}
			return (
				<Annotation
					key={annotation.id}
					annotation={annotation}

					active={active}

					showAnnotationForm={this.props.showAnnotationForm}
					setAnnotation={this.props.setAnnotation}
					deleteAnnotation={this.props.deleteAnnotation}
					playAnnotation={this.props.playAnnotation}
				/>
			);
		}, this);
		return (
			<div>
				<h3>Saved annotations</h3>
				<ul className="list-group">
					{annotations}
				</ul>
			</div>
		);
	}
};

export default AnnotationList;