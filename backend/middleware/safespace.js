const db = require('../database/db');

// Allowed roles for SafeSpace data access
const SAFESPACE_ROLES = ['guidance_counselor', 'safespace_admin'];

/**
 * Middleware: Verify the requesting user has an authorized SafeSpace role.
 * Runs AFTER authenticateToken so req.user is already populated.
 */
function requireSafeSpaceAccess(req, res, next) {
  if (!req.user || !SAFESPACE_ROLES.includes(req.user.role)) {
    // Log unauthorized access attempt
    try {
      db.prepare(
        `INSERT INTO safespace_access_log (user_id, action, ip_address)
         VALUES (?, 'view_list', ?)`
      ).run(req.user?.id || 0, req.ip || 'unknown');
    } catch (_) { /* silent — don't leak info */ }

    return res.status(403).json({
      error: 'Access denied. SafeSpace data requires authorized clearance.',
    });
  }
  next();
}

/**
 * Middleware: Log every SafeSpace data access for audit trail.
 */
function logSafeSpaceAccess(action) {
  return (req, res, next) => {
    try {
      db.prepare(
        `INSERT INTO safespace_access_log (user_id, action, report_id, ip_address)
         VALUES (?, ?, ?, ?)`
      ).run(req.user.id, action, req.params.id || null, req.ip || 'unknown');
    } catch (_) { /* silent */ }
    next();
  };
}

/**
 * Middleware: Flag request to bypass general admin logging.
 * SafeSpace submissions must NEVER appear in general notifications or dashboard stats.
 */
function bypassGeneralLogging(req, res, next) {
  req.skipGeneralLog = true;
  next();
}

module.exports = {
  requireSafeSpaceAccess,
  logSafeSpaceAccess,
  bypassGeneralLogging,
  SAFESPACE_ROLES,
};
