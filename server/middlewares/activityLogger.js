import ActivityLog from '../models/ActivityLog.js';

export const logActivity = (options = {}) => {
  return async (req, res, next) => {
    const { action, resourceType, getResourceId, getMetadata } = options;

    // Store original send function
    const originalSend = res.send;
    res.send = function (data) {
      // Log activity after response is sent
      if (req.user && res.statusCode < 400) {
        try {
          const activityLog = new ActivityLog({
            user: req.user._id,
            action: action || req.method + ' ' + req.path,
            resourceType,
            resourceId: getResourceId ? getResourceId(req) : undefined,
            metadata: getMetadata ? getMetadata(req, res, data) : undefined,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          });
          activityLog.save().catch(() => {});
        } catch (err) {
          // Do not block the response
        }
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

export default logActivity;
