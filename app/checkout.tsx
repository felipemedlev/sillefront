import { createLazyComponent } from '../src/utils/lazyload';

// Lazy load the checkout component (heavy with payment processing)
const LazyCheckoutScreen = createLazyComponent(
  () => import('./components/checkout-component')
);

export default LazyCheckoutScreen;