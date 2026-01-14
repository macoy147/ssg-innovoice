import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  // Admin who performed the action
  adminRole: {
    type: String,
    required: true,
    enum: ['executive', 'press_secretary', 'network_secretary', 'developer']
  },
  adminLabel: {
    type: String,
    required: true
  },
  
  // Action details
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'session_ended',
      'view_suggestion',
      'update_status',
      'update_priority',
      'archive_suggestion',
      'unarchive_suggestion',
      'delete_suggestion',
      'bulk_delete',
      'restore_suggestion',
      'permanent_delete',
      'empty_trash',
      'mark_read'
    ]
  },
  
  // Target suggestion (if applicable)
  suggestionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Suggestion',
    default: null
  },
  suggestionTitle: {
    type: String,
    default: null
  },
  suggestionTrackingCode: {
    type: String,
    default: null
  },
  
  // Additional details
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Metadata
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ adminRole: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
