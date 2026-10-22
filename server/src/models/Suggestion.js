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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentUser',
    default: null,
    index: true
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
  aiPriorityReason: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: String,
    changedBy: String
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  readBy: {
    type: String
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  archivedBy: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: String
  },
  deletedByRole: {
    type: String,
    trim: true,
    default: null
  },
  deletedReason: {
    type: String,
    trim: true,
    maxlength: 500,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for optimal admin filtering, sorting, and stats aggregation
suggestionSchema.index({ isDeleted: 1, isArchived: 1, createdAt: -1 });
suggestionSchema.index({ isDeleted: 1, isArchived: 1, status: 1 });
suggestionSchema.index({ isDeleted: 1, isArchived: 1, category: 1 });
suggestionSchema.index({ isDeleted: 1, isArchived: 1, priority: 1 });
suggestionSchema.index({ isDeleted: 1, isArchived: 1, isRead: 1 });
suggestionSchema.index({ isDeleted: 1, isArchived: 1, isAnonymous: 1 });

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

// Virtual for user_id alias
suggestionSchema.virtual('user_id').get(function() {
  return this.userId;
});
suggestionSchema.set('toJSON', { virtuals: true });
suggestionSchema.set('toObject', { virtuals: true });

const Suggestion = mongoose.model('Suggestion', suggestionSchema);

export default Suggestion;
