//required imports for the functions
import {render} from 'react-dom';
import Recipe from './Recipe.jsx';
import AnnotationRecipe from './AnnotationRecipe.jsx';

//cooking function
export function cookRecipe (recipe, elementId) {
	if(recipe.type === 'annotation') {
		render(<AnnotationRecipe ingredients={recipe.ingredients}/>, document.getElementById(elementId));
	} else if(recipe.type === 'search') {
		render(<Recipe ingredients={recipe.ingredients}/>, document.getElementById(elementId));
	} else {
		console.error('Please provide a valid recipe');
	}
}

//apis
export {default as AnnotationAPI} from './api/AnnotationAPI.js';
export {default as CollectionAPI} from './api/CollectionAPI.js';
export {default as SearchAPI} from './api/SearchAPI.js';

//collection related components
export {default as CollectionSelector} from './components/CollectionSelector.jsx';
export {default as CollectionStats} from './components/CollectionStats.jsx';
export {default as CollectionAnalyser} from './components/CollectionAnalyser.jsx';

//search related components
export {default as FacetSearchComponent} from './components/FacetSearchComponent.jsx';
export {default as SearchSnippet} from './components/SearchSnippet.jsx';
export {default as ItemDetails} from './components/ItemDetails.jsx';

//data visualisation components
export {default as LineChart} from './components/LineChart.jsx';

//flex components
export {default as FlexBox} from './components/FlexBox.jsx';
export {default as FlexHits} from './components/FlexHits.jsx';
export {default as FlexModal} from './components/FlexModal.jsx';
export {default as FlexComponentInfo} from './components/FlexComponentInfo.jsx';

//collection mappings (should they be here?)
export {default as CollectionConfig} from './collection/mappings/CollectionConfig.jsx';
export {default as NISVCatalogueConfig} from './collection/mappings/NISVCatalogueConfig.jsx';
export {default as NISVProgramGuideConfig} from './collection/mappings/NISVProgramGuideConfig.jsx';
export {default as SpeechAndernieuwsConfig} from './collection/mappings/SpeechAndernieuwsConfig.jsx';

//utils
export {default as CollectionDataUtil} from './util/CollectionDataUtil.js';
export {default as CollectionUtil} from './util/CollectionUtil.js';
export {default as TimeUtil} from './util/TimeUtil.js';

//video annotation
export {default as AnnotationBox} from './components/annotation/AnnotationBox.jsx';
export {default as VimeoPlayer} from './player/VimeoPlayer.js';
export {default as SegmentationControls} from './components/annotation/SegmentationControls.jsx';