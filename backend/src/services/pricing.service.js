/**
 * Pricing Service
 * Handles calculation of base price, weekend surcharges, peak-season charges,
 * insurance options, additional driver fees, late-return fees, and damage charges.
 */

class PricingService {
  /**
   * Determine if a date falls in peak season (e.g., Summer: June-Aug, Winter Holidays: Dec)
   */
  isDateInPeakSeason(date) {
    if (!date) return false;
    const d = new Date(date);
    const month = d.getMonth(); // 0-indexed: 5 = June, 6 = July, 7 = Aug, 11 = Dec
    return month === 5 || month === 6 || month === 7 || month === 11;
  }

  /**
   * Calculate weekend days (Saturday & Sunday) between start and end dates
   */
  countWeekendDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Ensure valid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    let count = 0;
    const current = new Date(start);

    // If start equals end date, check that single day
    if (start.getTime() === end.getTime()) {
      const day = current.getDay();
      return (day === 0 || day === 6) ? 1 : 0;
    }

    // Loop through days up to end date (exclusive of exact end moment if midnight, or count full days)
    while (current < end) {
      const day = current.getDay();
      if (day === 0 || day === 6) { // 0 = Sun, 6 = Sat
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  /**
   * Calculate full pricing breakdown
   * @param {Object} params 
   * @param {Date|string} params.startDate 
   * @param {Date|string} params.endDate 
   * @param {number} params.dailyRate 
   * @param {boolean|string} [params.insurancePlan] - 'NONE' | 'BASIC' | 'PREMIUM' | 'FULL_COVERAGE'
   * @param {boolean} [params.hasAdditionalDriver] 
   * @param {boolean} [params.isPeakSeason] 
   * @param {number} [params.lateHours] 
   * @param {number} [params.hourlyLateFeeRate] 
   * @param {number} [params.damageCharges] 
   * @param {number} [params.discount] 
   * @param {number} [params.taxRate] - Default 0.10 (10%)
   */
  calculatePricing(params = {}) {
    const {
      startDate,
      endDate,
      dailyRate = 100,
      insurancePlan = 'NONE',
      hasInsurance = false,
      hasAdditionalDriver = false,
      isPeakSeason: explicitPeakSeason,
      lateHours = 0,
      hourlyLateFeeRate = 15,
      damageCharges = 0,
      discount = 0,
      taxRate = 0.10,
    } = params;

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 24 * 60 * 60 * 1000);

    // Calculate total duration in days (minimum 1 day)
    const diffMs = Math.max(0, end.getTime() - start.getTime());
    const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    // Base price
    const rate = Math.max(0, Number(dailyRate) || 0);
    const basePrice = totalDays * rate;

    // Weekend Surcharge (20% surcharge per weekend day)
    const weekendDays = this.countWeekendDays(start, end);
    const weekendSurchargeRate = 0.20; // 20%
    const weekendCharges = Number((weekendDays * (rate * weekendSurchargeRate)).toFixed(2));

    // Peak Season Surcharge (15% on base price if during peak season)
    const isPeak = explicitPeakSeason !== undefined
      ? Boolean(explicitPeakSeason)
      : (this.isDateInPeakSeason(start) || this.isDateInPeakSeason(end));
    const peakSurchargeRate = 0.15; // 15%
    const peakCharges = isPeak ? Number((basePrice * peakSurchargeRate).toFixed(2)) : 0;

    // Insurance Fee
    // Insurance rates per day: BASIC ($15), PREMIUM ($30), FULL_COVERAGE ($45)
    let selectedInsurance = insurancePlan;
    if (hasInsurance && insurancePlan === 'NONE') {
      selectedInsurance = 'BASIC';
    }
    
    let dailyInsuranceRate = 0;
    if (selectedInsurance === 'BASIC') dailyInsuranceRate = 15;
    else if (selectedInsurance === 'PREMIUM') dailyInsuranceRate = 30;
    else if (selectedInsurance === 'FULL_COVERAGE') dailyInsuranceRate = 45;

    const insuranceFee = totalDays * dailyInsuranceRate;

    // Additional Driver Fee ($15 per day)
    const additionalDriverDailyRate = 15;
    const additionalDriverFee = hasAdditionalDriver ? (totalDays * additionalDriverDailyRate) : 0;

    // Late Return Fee
    const validLateHours = Math.max(0, Number(lateHours) || 0);
    const validHourlyLateRate = Math.max(0, Number(hourlyLateFeeRate) || 15);
    const lateFee = Number((validLateHours * validHourlyLateRate).toFixed(2));

    // Damage Charges
    const validDamageCharges = Math.max(0, Number(damageCharges) || 0);

    // Subtotal
    const subtotal = Number(
      (basePrice + weekendCharges + peakCharges + insuranceFee + additionalDriverFee + lateFee + validDamageCharges).toFixed(2)
    );

    // Tax
    const validTaxRate = Math.max(0, Number(taxRate) || 0);
    const taxAmount = Number((subtotal * validTaxRate).toFixed(2));

    // Final Total
    const validDiscount = Math.max(0, Number(discount) || 0);
    const totalAmount = Math.max(0, Number((subtotal + taxAmount - validDiscount).toFixed(2)));

    return {
      startDate: start,
      endDate: end,
      totalDays,
      dailyRate: rate,
      basePrice,
      weekendDays,
      weekendCharges,
      isPeakSeason: isPeak,
      peakCharges,
      insurancePlan: selectedInsurance,
      insuranceFee,
      hasAdditionalDriver: Boolean(hasAdditionalDriver),
      additionalDriverFee,
      lateHours: validLateHours,
      hourlyLateFeeRate: validHourlyLateRate,
      lateFee,
      damageCharges: validDamageCharges,
      subtotal,
      taxRate: validTaxRate,
      taxAmount,
      discount: validDiscount,
      totalAmount,
    };
  }
}

module.exports = new PricingService();
module.exports.PricingService = PricingService;
