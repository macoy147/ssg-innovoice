import mongoose from 'mongoose';

const reportTombstoneSchema = new mongoose.Schema({
  trackingCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    trim: true,
    default: 'Report'
  },
  category: {
    type: String,
    default: 'general'
  },
  status: {
    type: String,
    default: 'purged'
  },
  reason: {
    type: String,
    trim: true,
    default: 'Permanently purged during administrative maintenance'
  },
  purgedAt: {
    type: Date,
    default: Date.now
  },
  purgedBy: {
    type: String,
    default: 'Administration'
  }
}, {
  timestamps: true
});

const ReportTombstone = mongoose.model('ReportTombstone', reportTombstoneSchema);

export default ReportTombstone;
