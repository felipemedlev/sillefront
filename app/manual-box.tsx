import { createLazyComponent } from '../src/utils/lazyload';

// Lazy load the manual box component (heavy with product selection)
const LazyManualBoxScreen = createLazyComponent(
  () => import('./components/manual-box-component')
);

export default LazyManualBoxScreen;