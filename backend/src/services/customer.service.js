const reservationService = require('./reservation.service');
const rentalService = require('./rental.service');
const invoiceService = require('./invoice.service');
const ratingService = require('./rating.service');

class CustomerService {
  /**
   * Aggregates complete dashboard data for a customer
   * @param {String} userId - Logged-in customer ID
   */
  async getCustomerDashboard(userId) {
    if (!userId) {
      const error = new Error('User ID is required');
      error.statusCode = 400;
      throw error;
    }

    // 1. Fetch user data concurrently
    const [reservations, rentals, invoices, ratings] = await Promise.all([
      reservationService.getUserReservations(userId).catch(() => []),
      rentalService.getUserRentals(userId).catch(() => []),
      invoiceService.getUserInvoices(userId).catch(() => []),
      ratingService.getUserRatings(userId).catch(() => []),
    ]);

    // 2. Metrics calculation
    const totalReservations = reservations ? reservations.length : 0;
    
    const activeRentals = rentals
      ? rentals.filter((r) => r.status === 'ACTIVE' || r.status === 'OVERDUE').length
      : 0;
      
    const completedRentals = rentals
      ? rentals.filter((r) => r.status === 'COMPLETED').length
      : 0;

    const totalSpent = invoices
      ? invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0)
      : 0;

    const ratingsCount = ratings ? ratings.length : 0;
    const averageRatingGiven =
      ratingsCount > 0
        ? Math.round((ratings.reduce((sum, r) => sum + Number(r.score), 0) / ratingsCount) * 10) / 10
        : 0;

    return {
      summary: {
        totalReservations,
        activeRentals,
        completedRentals,
        totalSpent: Math.round(totalSpent * 100) / 100,
        ratingsCount,
        averageRatingGiven,
      },
      recentReservations: reservations ? reservations.slice(0, 5) : [],
      recentRentals: rentals ? rentals.slice(0, 5) : [],
      recentInvoices: invoices ? invoices.slice(0, 5) : [],
      recentRatings: ratings ? ratings.slice(0, 5) : [],
    };
  }
}

module.exports = new CustomerService();
