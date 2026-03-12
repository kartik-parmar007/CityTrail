const mongoose = require('mongoose');

const siteStatsSchema = new mongoose.Schema({
  totalVisits: {
    type: Number,
    default: 0
  },
  lastVisitAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('SiteStats', siteStatsSchema);
