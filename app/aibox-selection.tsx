import { createLazyComponent } from '../src/utils/lazyload';

// Lazy load the AI box selection component (heavy with product selection and AI interactions)
const LazyAIBoxSelectionScreen = createLazyComponent(
  () => import('./components/aibox-selection-component')
);

export default LazyAIBoxSelectionScreen;