/**
 * Delivery charge rule, mirrored from the backend (pripriyaNewBackend/src/config/delivery.ts),
 * which is the source of truth for what is actually charged. Change both together.
 * Orders below the threshold pay a flat fee; orders at or above it ship free. It is judged on the
 * item subtotal (sum of item prices, before any coupon).
 */
export const FREE_DELIVERY_THRESHOLD = 499;
export const DELIVERY_CHARGE = 80;

export const getDeliveryCharge = (orderSubtotal: number): number =>
  orderSubtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
