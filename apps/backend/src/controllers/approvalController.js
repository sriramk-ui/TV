const ShootRequest = require('../models/ShootRequest');
const ShootOccurrence = require('../models/ShootOccurrence');
const PAF = require('../models/PAF');
const ApprovalRecord = require('../models/ApprovalRecord');
const { processCMODecision } = require('../services/approvalService');
const { logActivity } = require('../services/auditService');
const { toRupees } = require('@sankara/shared');
const { SHOOT_STATUS } = require('@sankara/constants');

async function getPending(req, res, next) {
  try {
    const pendingShoots = await ShootRequest.find({
      status: SHOOT_STATUS.PENDING_APPROVAL
    }).sort({ last_submitted_at: -1 });

    const packages = [];
    for (const shoot of pendingShoots) {
      const occurrences = await ShootOccurrence.find({ shoot_id: shoot._id }).sort({ shoot_date: 1 });
      const paf = await PAF.findOne({ shoot_id: shoot._id });

      let pafObj = null;
      if (paf) {
        pafObj = paf.toObject();
        pafObj.estimated_total = toRupees(pafObj.estimated_total_paise);
        pafObj.items = pafObj.items.map((it) => ({
          ...it,
          rate: toRupees(it.rate_paise),
          amount: toRupees(it.amount_paise)
        }));
      }

      packages.push({
        shoot: shoot.toObject(),
        occurrences,
        paf: pafObj
      });
    }

    return res.status(200).json({
      success: true,
      data: packages
    });
  } catch (err) {
    next(err);
  }
}

async function decision(req, res, next) {
  try {
    const { id } = req.params;
    const { decision: userDecision, reason } = req.body;

    const result = await processCMODecision({
      shootId: id,
      decision: userDecision,
      reason,
      cmoUser: req.user
    });

    await logActivity({
      actor: req.user,
      action: userDecision === 'approve' ? 'CMO_APPROVED_PACKAGE' : 'CMO_CHANGES_REQUESTED',
      entityType: 'ShootRequest',
      entityId: id,
      details: { decision: userDecision, reason },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const records = await ApprovalRecord.find()
      .populate('actor_id', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      data: records
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPending,
  decision,
  getHistory
};
