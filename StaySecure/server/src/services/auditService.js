const AuditLog = require('../models/AuditLog');

const buildAuditEntry = ({ actorId, actorRole, action, resourceType, resourceId, details = {} }) => ({
  actorId: actorId || 'system',
  actorRole: actorRole || 'SYSTEM',
  action,
  resourceType,
  resourceId,
  details,
  timestamp: new Date().toISOString(),
});

const logAuditEvent = async ({ actorId, actorRole, action, resourceType, resourceId, details = {} }, model = AuditLog) => {
  const entry = buildAuditEntry({ actorId, actorRole, action, resourceType, resourceId, details });

  if (!model || typeof model.create !== 'function') {
    return entry;
  }

  return model.create(entry);
};

module.exports = {
  buildAuditEntry,
  logAuditEvent,
};
