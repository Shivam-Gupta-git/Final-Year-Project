/**
 * Shared hotel pricing utilities.
 * Import these wherever GST / price breakdown is needed
 * (detail page, checkout, booking confirmation, invoice, etc.)
 * so the logic never drifts between screens.
 *
 * Indian GST slab (per GST Council):
 *   < ₹1,000 / night  →  0 %
 *   ₹1,000–₹7,500     → 12 %
 *   > ₹7,500           → 18 %
 */

export const getGSTRate = (pricePerNight) => {
  if (pricePerNight < 1000) return 0;
  if (pricePerNight <= 7500) return 0.12;
  return 0.18;
};

export const getGSTLabel = (pricePerNight) => {
  if (pricePerNight < 1000) return "0% GST";
  if (pricePerNight <= 7500) return "12% GST";
  return "18% GST";
};

/**
 * Returns a full price breakdown object.
 * @param {{ pricePerNight: number, nights: number, rooms: number }} opts
 */
export const computePriceBreakdown = ({ pricePerNight, nights, rooms }) => {
  const baseAmount = pricePerNight * nights * rooms;
  const gstRate    = getGSTRate(pricePerNight);
  const gstAmount  = Math.round(baseAmount * gstRate);
  const totalAmount = baseAmount + gstAmount;
  return { baseAmount, gstRate, gstAmount, totalAmount };
};