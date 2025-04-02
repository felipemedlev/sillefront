import { Coupon } from '../types/coupon';

export const MOCK_COUPONS: Coupon[] = [
  {
    id: 'coupon-001',
    code: 'SILLÉ10', // Uppercase
    discountType: 'percentage',
    value: 10, // 10%
    description: '10% de descuento en tu compra.',
    minPurchaseAmount: 20000,
  },
  {
    id: 'coupon-002',
    code: 'DESC5000', // Uppercase
    discountType: 'fixed',
    value: 5000, // $5000 CLP
    description: '$5.000 de descuento.',
    minPurchaseAmount: 30000,
  },
  {
    id: 'coupon-003',
    code: 'EXPIRADO', // Uppercase
    discountType: 'percentage',
    value: 20,
    description: 'Cupón expirado de prueba.',
    expiryDate: Date.now() - 86400000 // Expired yesterday
  },
];