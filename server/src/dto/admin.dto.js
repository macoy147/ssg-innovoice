// Data Transfer Objects for Admin

export class AdminVerifyDTO {
  constructor(data) {
    this.password = data.password;
  }
}

export class AdminVerifyResponseDTO {
  constructor(adminInfo) {
    this.role = adminInfo.role;
    this.label = adminInfo.label;
    this.color = adminInfo.color;
    this.name = adminInfo.name || null;
    this.email = adminInfo.email || null;
    this.picture = adminInfo.picture || null;
  }
}

export class ActivityLogResponseDTO {
  constructor(log) {
    this._id = log._id ? log._id.toString() : (log.id || null);
    this.adminRole = log.adminRole;
    this.adminLabel = log.adminLabel;
    this.adminName = log.adminName || null;
    this.adminEmail = log.adminEmail || null;
    this.adminPicture = log.adminPicture || null;
    this.action = log.action;
    this.suggestionId = log.suggestionId;
    this.suggestionTitle = log.suggestionTitle;
    this.suggestionTrackingCode = log.suggestionTrackingCode;
    this.details = log.details;
    this.createdAt = log.createdAt;
    // Exclude sensitive data like IP and user agent from response
  }
}

export class OnlineAdminResponseDTO {
  constructor(admin) {
    this.role = admin.role;
    this.label = admin.label;
    this.color = admin.color;
    this.name = admin.name || null;
    this.email = admin.email || null;
    this.picture = admin.picture || null;
    this.lastSeen = admin.lastSeen;
    this.loginTime = admin.loginTime;
  }
}
