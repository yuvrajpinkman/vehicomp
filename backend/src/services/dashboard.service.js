const mongoose = require('mongoose');
const { Vehicle } = require('../models/Vehicle');
const Rental = require('../models/Rental');
const Reservation = require('../models/Reservation');
const { Maintenance } = require('../models/Maintenance');

class DashboardService {
  /**
   * Get consolidated fleet dashboard statistics
   */
  async getDashboardStats() {
    const isDbConnected = mongoose.connection.readyState === 1;

    let vehicles = [];
    let rentals = [];
    let reservations = [];
    let maintenances = [];

    if (isDbConnected) {
      try {
        [vehicles, rentals, reservations, maintenances] = await Promise.all([
          Vehicle.find({ isDeleted: false }).lean(),
          Rental.find().populate('vehicle').lean(),
          Reservation.find().populate('vehicle').lean(),
          Maintenance.find().populate('vehicle').lean(),
        ]);
      } catch (err) {
        console.warn('[DashboardService] DB query failed, falling back:', err.message);
      }
    }

    // 1. Vehicle Fleet Counts
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((v) => v.isActive !== false).length;
    const deactivatedVehicles = totalVehicles - activeVehicles;

    const statusCounts = {
      AVAILABLE: 0,
      RESERVED: 0,
      RENTED: 0,
      RETURNED: 0,
      INSPECTION: 0,
      DAMAGED: 0,
      MAINTENANCE: 0,
    };

    const typeBreakdown = {
      SUV: 0,
      SEDAN: 0,
      HATCHBACK: 0,
      LUXURY: 0,
      ELECTRIC: 0,
    };

    vehicles.forEach((v) => {
      if (statusCounts[v.status] !== undefined) {
        statusCounts[v.status]++;
      }
      if (typeBreakdown[v.vehicleType] !== undefined) {
        typeBreakdown[v.vehicleType]++;
      }
    });

    // Utilization rate = (RENTED + RESERVED) / activeVehicles * 100
    const inUseCount = statusCounts.RENTED + statusCounts.RESERVED;
    const utilizationRate = activeVehicles > 0
      ? Number(((inUseCount / activeVehicles) * 100).toFixed(1))
      : 0;

    // 2. Revenue Calculations
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let dailyRevenue = 0;
    let monthlyRevenue = 0;
    let totalGrossRevenue = 0;

    // Calculate revenue from Rentals
    rentals.forEach((r) => {
      // Approximate rental revenue: dailyRate * duration + lateFee
      const startDate = new Date(r.startDate || r.createdAt);
      const returnDate = r.actualReturnDate ? new Date(r.actualReturnDate) : new Date(r.expectedReturnDate);
      const days = Math.max(1, Math.ceil(Math.abs(returnDate - startDate) / (1000 * 60 * 60 * 24)));
      const rentalCost = (r.dailyRate || 0) * days + (r.lateFee || 0);

      totalGrossRevenue += rentalCost;

      if (startDate >= startOfMonth) {
        monthlyRevenue += rentalCost;
      }

      // Check if rental is active today or started today
      if (startDate >= startOfToday || (r.status === 'ACTIVE' && (!r.actualReturnDate || new Date(r.actualReturnDate) >= startOfToday))) {
        dailyRevenue += (r.dailyRate || 0);
      }
    });

    // Also include completed/confirmed Reservations if not duplicated by rental
    const rentalReservationIds = new Set(rentals.map((r) => r.reservation?.toString()).filter(Boolean));
    reservations.forEach((res) => {
      if (!rentalReservationIds.has(res._id.toString()) && ['CONFIRMED', 'COMPLETED'].includes(res.status)) {
        const resDate = new Date(res.createdAt || res.startDate);
        const amount = res.totalPrice || 0;

        totalGrossRevenue += amount;

        if (resDate >= startOfMonth) {
          monthlyRevenue += amount;
        }

        if (resDate >= startOfToday) {
          dailyRevenue += (res.pricePerDay || 0);
        }
      }
    });

    // 3. Maintenance Cost Calculations
    let totalMaintenanceCost = 0;
    let monthlyMaintenanceCost = 0;

    maintenances.forEach((m) => {
      const cost = m.status === 'COMPLETED' ? (m.actualCost || m.estimatedCost || 0) : (m.estimatedCost || 0);
      totalMaintenanceCost += cost;

      const mDate = new Date(m.createdAt || m.startDate);
      if (mDate >= startOfMonth) {
        monthlyMaintenanceCost += cost;
      }
    });

    // Net Profit = Total Gross Revenue - Total Maintenance Cost
    const netProfit = totalGrossRevenue - totalMaintenanceCost;
    const monthlyNetProfit = monthlyRevenue - monthlyMaintenanceCost;

    // 4. Most Rented Vehicle Calculation
    const vehicleTripMap = {};

    rentals.forEach((r) => {
      const vId = r.vehicle?._id ? r.vehicle._id.toString() : r.vehicle?.toString();
      if (!vId) return;

      if (!vehicleTripMap[vId]) {
        vehicleTripMap[vId] = {
          vehicle: r.vehicle,
          trips: 0,
          revenue: 0,
        };
      }
      vehicleTripMap[vId].trips++;
      const startDate = new Date(r.startDate || r.createdAt);
      const returnDate = r.actualReturnDate ? new Date(r.actualReturnDate) : new Date(r.expectedReturnDate);
      const days = Math.max(1, Math.ceil(Math.abs(returnDate - startDate) / (1000 * 60 * 60 * 24)));
      vehicleTripMap[vId].revenue += (r.dailyRate || 0) * days + (r.lateFee || 0);
    });

    reservations.forEach((res) => {
      const vId = res.vehicle?._id ? res.vehicle._id.toString() : res.vehicle?.toString();
      if (!vId) return;

      if (!vehicleTripMap[vId]) {
        vehicleTripMap[vId] = {
          vehicle: res.vehicle,
          trips: 0,
          revenue: 0,
        };
      }
      vehicleTripMap[vId].trips++;
      vehicleTripMap[vId].revenue += (res.totalPrice || 0);
    });

    let mostRentedVehicle = null;
    let maxTrips = -1;

    Object.values(vehicleTripMap).forEach((entry) => {
      if (entry.trips > maxTrips) {
        maxTrips = entry.trips;
        mostRentedVehicle = {
          vehicleId: entry.vehicle?._id || entry.vehicle,
          make: entry.vehicle?.make || 'Unknown',
          model: entry.vehicle?.model || 'Model',
          registrationNumber: entry.vehicle?.registrationNumber || 'N/A',
          vehicleType: entry.vehicle?.vehicleType || 'SEDAN',
          pricePerDay: entry.vehicle?.pricePerDay || 0,
          status: entry.vehicle?.status || 'AVAILABLE',
          totalTrips: entry.trips,
          totalRevenue: entry.revenue,
        };
      }
    });

    // Fallback if no rentals exist yet: take first vehicle in fleet
    if (!mostRentedVehicle && vehicles.length > 0) {
      const first = vehicles[0];
      mostRentedVehicle = {
        vehicleId: first._id,
        make: first.make,
        model: first.model,
        registrationNumber: first.registrationNumber,
        vehicleType: first.vehicleType,
        pricePerDay: first.pricePerDay,
        status: first.status,
        totalTrips: 0,
        totalRevenue: 0,
      };
    }

    return {
      fleet: {
        totalVehicles,
        activeVehicles,
        deactivatedVehicles,
        utilizationRate,
        statusCounts,
        typeBreakdown,
      },
      revenue: {
        dailyRevenue,
        monthlyRevenue,
        totalGrossRevenue,
        totalMaintenanceCost,
        monthlyMaintenanceCost,
        netProfit,
        monthlyNetProfit,
      },
      mostRentedVehicle,
    };
  }

  /**
   * Get 7-day revenue vs maintenance trend
   */
  async getRevenueTrend(daysCount = 7) {
    const trend = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      let dayRentalRevenue = 0;
      let dayMaintenanceSpend = 0;

      if (mongoose.connection.readyState === 1) {
        try {
          const [dayRentals, dayReservations, dayMaintenance] = await Promise.all([
            Rental.find({ createdAt: { $gte: dayStart, $lte: dayEnd } }).lean(),
            Reservation.find({ createdAt: { $gte: dayStart, $lte: dayEnd } }).lean(),
            Maintenance.find({ createdAt: { $gte: dayStart, $lte: dayEnd } }).lean(),
          ]);

          dayRentals.forEach((r) => {
            dayRentalRevenue += (r.dailyRate || 0);
          });
          dayReservations.forEach((res) => {
            dayRentalRevenue += (res.totalPrice || 0);
          });
          dayMaintenance.forEach((m) => {
            dayMaintenanceSpend += (m.actualCost || m.estimatedCost || 0);
          });
        } catch (err) {
          // fallback
        }
      }

      trend.push({
        date: dateStr,
        day: dayName,
        revenue: dayRentalRevenue,
        maintenanceCost: dayMaintenanceSpend,
        net: dayRentalRevenue - dayMaintenanceSpend,
      });
    }

    return trend;
  }

  /**
   * Get performance leaderboard ranking all fleet vehicles
   */
  async getVehiclePerformanceLeaderboard() {
    let vehicles = [];
    let rentals = [];
    let reservations = [];

    if (mongoose.connection.readyState === 1) {
      try {
        [vehicles, rentals, reservations] = await Promise.all([
          Vehicle.find({ isDeleted: false }).lean(),
          Rental.find().populate('vehicle').lean(),
          Reservation.find().populate('vehicle').lean(),
        ]);
      } catch (err) {
        // fallback
      }
    }

    const leaderboard = vehicles.map((v) => {
      const vId = v._id.toString();

      let trips = 0;
      let totalDays = 0;
      let revenue = 0;

      rentals.forEach((r) => {
        const rVId = r.vehicle?._id ? r.vehicle._id.toString() : r.vehicle?.toString();
        if (rVId === vId) {
          trips++;
          const s = new Date(r.startDate || r.createdAt);
          const e = r.actualReturnDate ? new Date(r.actualReturnDate) : new Date(r.expectedReturnDate);
          const days = Math.max(1, Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)));
          totalDays += days;
          revenue += (r.dailyRate || 0) * days + (r.lateFee || 0);
        }
      });

      reservations.forEach((res) => {
        const resVId = res.vehicle?._id ? res.vehicle._id.toString() : res.vehicle?.toString();
        if (resVId === vId) {
          trips++;
          totalDays += (res.totalDays || 1);
          revenue += (res.totalPrice || 0);
        }
      });

      return {
        vehicleId: v._id,
        make: v.make,
        model: v.model,
        registrationNumber: v.registrationNumber,
        vehicleType: v.vehicleType,
        status: v.status,
        condition: v.condition,
        pricePerDay: v.pricePerDay,
        totalTrips: trips,
        totalDaysUtilized: totalDays,
        totalRevenueEarned: revenue,
      };
    });

    // Sort descending by revenue, then trips
    leaderboard.sort((a, b) => b.totalRevenueEarned - a.totalRevenueEarned || b.totalTrips - a.totalTrips);

    return leaderboard;
  }
}

module.exports = new DashboardService();
