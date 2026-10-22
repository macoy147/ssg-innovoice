import mongoose from 'mongoose';

const savedReportSchema = new mongoose.Schema({
  trackingCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  },
  isOwner: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const studentUserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  picture: {
    type: String,
    trim: true
  },
  savedReports: [savedReportSchema],
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for fast lookups
studentUserSchema.index({ email: 1 });
studentUserSchema.index({ 'savedReports.trackingCode': 1 });

const StudentUser = mongoose.model('StudentUser', studentUserSchema);

export default StudentUser;
