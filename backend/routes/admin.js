const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');
const SiteStats = require('../models/SiteStats');

// Middleware to protect admin routes
router.get('/analytics', protect, restrictTo('superadmin', 'subadmin'), getAnalytics);

// Public route to track visitor
router.post('/track-visit', async (req, res) => {
  try {
    let siteStats = await SiteStats.findOne();
    if (!siteStats) {
      siteStats = await SiteStats.create({ totalVisits: 1 });
    } else {
      siteStats.totalVisits += 1;
      siteStats.lastVisitAt = Date.now();
      await siteStats.save();
    }
    res.json({ success: true, visits: siteStats.totalVisits });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
