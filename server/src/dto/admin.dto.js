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
  }
}

export class ActivityLogResponseDTO {
  constructor(log) {
    this.adminRole = log.adminRole;
    this.adminLabel = log.adminLabel;
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
    this.lastSeen = admin.lastSeen;
    this.loginTime = admin.loginTime;
  }
}
