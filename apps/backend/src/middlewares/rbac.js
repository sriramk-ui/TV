const { ROLES } = require('@sankara/constants');

/**
 * Middleware to check if current authenticated user has one of the allowed roles.
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Role "${req.user.role}" does not have permission to perform this action.`
        }
      });
    }

    next();
  };
}

/**
 * Ensures Executive Producer or Crew cannot access PAF financial endpoints under any circumstance.
 */
function forbidEPAndCrewFinancialAccess(req, res, next) {
  const role = req.user?.role;
  if (role === ROLES.EP || role === ROLES.CREW) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FINANCIAL_ACCESS_FORBIDDEN',
        message: 'Executive Producers and Crew members are strictly prohibited from accessing PAF financial budgets, rates, or line items.'
      }
    });
  }
  next();
}

/**
 * Checks Accounts role access rules: Accounts can only view PAFs with status 'approved'.
 */
function enforceAccountsApprovedOnly(req, res, next) {
  const role = req.user?.role;
  if (role === ROLES.ACCOUNTS) {
    // Flag req to filter only approved records in controllers
    req.approvedOnly = true;
  }
  next();
}

module.exports = {
  requireRoles,
  forbidEPAndCrewFinancialAccess,
  enforceAccountsApprovedOnly
};
