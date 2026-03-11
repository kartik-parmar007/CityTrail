const Booking = require('../models/Booking');
const User = require('../models/User');

// Get all analytics for admin
exports.getAnalytics = async (req, res) => {
  try {
    // 1. Total Users
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalSubAdmins = await User.countDocuments({ role: 'subadmin' });

    // 2. Booking Stats
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const completedBookings = await Booking.countDocuments({ status: 'Completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });
    const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });

    // 3. Revenue (Sum of completed bookings)
    const revenueData = await Booking.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$calculatedPrice' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // 4. Monthly Booking Trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, '$calculatedPrice', 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 5. Recent Bookings (top 5)
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // For "Website Opens", we'll use a simple counter from a new SiteStats model if it exists, 
    // or just return a placeholder for now until we implement the tracker.
    // Let's assume we'll add SiteStats model next.
    const SiteStats = require('../models/SiteStats');
    let siteStats = await SiteStats.findOne();
    if (!siteStats) {
      siteStats = await SiteStats.create({ totalVisits: 0 });
    }

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          subAdmins: totalSubAdmins
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          confirmed: confirmedBookings
        },
        revenue: totalRevenue,
        monthlyTrends,
        recentBookings,
        siteVisits: siteStats.totalVisits
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
