import { createLazyComponent } from '../../src/utils/lazyload';

// Lazy load the survey component (heavy with interactive forms)
const LazySurveyScreen = createLazyComponent(
  () => import('../components/survey-id-component')
);

export default LazySurveyScreen;