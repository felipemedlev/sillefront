import { createLazyComponent } from '../src/utils/lazyload';

// Lazy load the occasion selection component (heavy with product selection and filtering)
const LazyOccasionSelectionScreen = createLazyComponent(
  () => import('./components/occasion-selection-component')
);

export default LazyOccasionSelectionScreen;