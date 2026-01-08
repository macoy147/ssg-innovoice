import mongoose from 'mongoose';

const suggestionSchema = new mongoose.Schema({
  trackingCode: {
    type: String,
    unique: true,
    uppercase: true
  },
  category: {
    type: String,
    required: true,
    enum: ['academic', 'administrative', 'extracurricular', 'general']
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },
  submitter: {
    name: {
      type: String,
      trim: true
    },
    studentId: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    contactNumber: {
      type: String,
      trim: true
    },
    course: {
      type: String,
      trim: true
    },
    yearLevel: {
      type: String,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '']
    },
    wantsFollowUp: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'forwarded', 'action_taken', 'resolved', 'rejected'],
    default: 'submitted'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Generate unique tracking code before validation
suggestionSchema.pre('validate', function(next) {
  if (!this.trackingCode) {
    const prefix = 'VISI';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.trackingCode = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

const Suggestion = mongoose.model('Suggestion', suggestionSchema);

export default Suggestion;
