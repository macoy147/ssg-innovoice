// Data Transfer Objects for Suggestion

export class CreateSuggestionDTO {
  constructor(data) {
    this.category = data.category;
    this.title = data.title?.trim();
    this.content = data.content?.trim();
    this.isAnonymous = Boolean(data.isAnonymous);
    this.image = data.image;
    
    // Only include submitter if not anonymous
    if (!this.isAnonymous && data.submitter) {
      this.submitter = {
        name: data.submitter.name?.trim() || '',
        studentId: data.submitter.studentId?.trim() || '',
        email: data.submitter.email?.trim().toLowerCase() || '',
        contactNumber: data.submitter.contactNumber?.trim() || '',
        course: data.submitter.course?.trim() || '',
        yearLevel: data.submitter.yearLevel || '',
        wantsFollowUp: Boolean(data.submitter.wantsFollowUp)
      };
    }
  }
}

export class UpdateStatusDTO {
  constructor(data) {
    this.status = data.status;
    this.notes = data.notes?.trim() || '';
  }
}

export class UpdatePriorityDTO {
  constructor(data) {
    this.priority = data.priority;
  }
}

export class BulkDeleteDTO {
  constructor(data) {
    this.ids = Array.isArray(data.ids) ? data.ids : [];
  }
}

// Response DTOs - control what gets sent to clients
export class SuggestionResponseDTO {
  constructor(suggestion) {
    this._id = suggestion._id;
    this.trackingCode = suggestion.trackingCode;
    this.category = suggestion.category;
    this.title = suggestion.title;
    this.content = suggestion.content;
    this.isAnonymous = suggestion.isAnonymous;
    this.status = suggestion.status;
    this.priority = suggestion.priority;
    this.aiPriorityReason = suggestion.aiPriorityReason;
    this.imageUrl = suggestion.imageUrl;
    this.isRead = suggestion.isRead;
    this.readAt = suggestion.readAt;
    this.readBy = suggestion.readBy;
    this.isArchived = suggestion.isArchived;
    this.archivedAt = suggestion.archivedAt;
    this.archivedBy = suggestion.archivedBy;
    this.statusHistory = suggestion.statusHistory;
    this.createdAt = suggestion.createdAt;
    this.updatedAt = suggestion.updatedAt;
    
    // Only include submitter if not anonymous
    if (!suggestion.isAnonymous && suggestion.submitter) {
      this.submitter = {
        name: suggestion.submitter.name,
        studentId: suggestion.submitter.studentId,
        email: suggestion.submitter.email,
        contactNumber: suggestion.submitter.contactNumber,
        course: suggestion.submitter.course,
        yearLevel: suggestion.submitter.yearLevel,
        wantsFollowUp: suggestion.submitter.wantsFollowUp
      };
    }
  }
}

export class PublicSuggestionResponseDTO {
  constructor(suggestion) {
    this.trackingCode = suggestion.trackingCode;
    this.category = suggestion.category;
    this.title = suggestion.title;
    this.content = suggestion.content;
    this.status = suggestion.status;
    this.priority = suggestion.priority;
    this.imageUrl = suggestion.imageUrl;
    this.statusHistory = suggestion.statusHistory?.map(h => ({
      status: h.status,
      changedAt: h.changedAt,
      notes: h.notes
      // Exclude changedBy for public view
    }));
    this.createdAt = suggestion.createdAt;
    this.updatedAt = suggestion.updatedAt;
    
    // Never expose submitter info in public tracking
  }
}

export class CreateSuggestionResponseDTO {
  constructor(suggestion, aiAnalyzed) {
    this.trackingCode = suggestion.trackingCode;
    this.category = suggestion.category;
    this.title = suggestion.title;
    this.status = suggestion.status;
    this.priority = suggestion.priority;
    this.aiPriorityReason = suggestion.aiPriorityReason;
    this.aiAnalyzed = aiAnalyzed;
    this.imageUrl = suggestion.imageUrl;
    this.createdAt = suggestion.createdAt;
  }
}
