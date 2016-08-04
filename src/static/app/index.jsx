//required imports for the functions
import {render} from 'react-dom';
import Recipe from './Recipe';
import AnnotationRecipe from './AnnotationRecipe';

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
export {default as AnnotationAPI} from './api/AnnotationAPI';
export {default as CollectionAPI} from './api/CollectionAPI';
export {default as SearchAPI} from './api/SearchAPI';

//collection related components
export {default as CollectionSelector} from './components/CollectionSelector';
export {default as CollectionStats} from './components/CollectionStats';
export {default as CollectionAnalyser} from './components/CollectionAnalyser';

//search related components
export {default as FacetSearchComponent} from './components/FacetSearchComponent';
export {default as SearchSnippet} from './components/SearchSnippet';
export {default as ItemDetails} from './components/ItemDetails';

//data visualisation components
export {default as LineChart} from './components/LineChart';

//flex components
export {default as FlexBox} from './components/FlexBox';
export {default as FlexHits} from './components/FlexHits';
export {default as FlexModal} from './components/FlexModal';
export {default as FlexComponentInfo} from './components/FlexComponentInfo';

//collection mappings (should they be here?)
export {default as CollectionConfig} from './collection/mappings/CollectionConfig';
export {default as NISVCatalogueConfig} from './collection/mappings/NISVCatalogueConfig';
export {default as NISVProgramGuideConfig} from './collection/mappings/NISVProgramGuideConfig';
export {default as SpeechAndernieuwsConfig} from './collection/mappings/SpeechAndernieuwsConfig';

//utils
export {default as CollectionDataUtil} from './util/CollectionDataUtil';
export {default as CollectionUtil} from './util/CollectionUtil';
export {default as TimeUtil} from './util/TimeUtil';

//video annotation
export {default as AnnotationBox} from './components/annotation/AnnotationBox';
export {default as CommentingForm} from './components/annotation/CommentingForm';
export {default as ClassifyingForm} from './components/annotation/ClassifyingForm';
export {default as LinkingForm} from './components/annotation/LinkingForm';
export {default as FlexPlayer} from './player/FlexPlayer';
export {default as VimeoPlayer} from './player/VimeoPlayer';
export {default as JWPlayer} from './player/JWPlayer';
export {default as SegmentationControls} from './components/annotation/SegmentationControls';