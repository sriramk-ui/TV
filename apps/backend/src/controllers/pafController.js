const { savePAF, getPAFById, listPAFs } = require('../services/pafService');
const { logActivity } = require('../services/auditService');
const { formatINR, toRupees } = require('@sankara/shared');
const { ROLES } = require('@sankara/constants');

async function save(req, res, next) {
  try {
    const {
      id,
      shoot_id,
      show_name,
      shoot_start,
      shoot_end,
      location,
      episodes,
      equipment_type,
      notes,
      items = []
    } = req.body;

    if (!shoot_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Shoot request ID is required to prepare a PAF.' }
      });
    }

    const paf = await savePAF({
      id,
      shootId: shoot_id,
      showName: show_name,
      shootStart: shoot_start,
      shootEnd: shoot_end,
      location,
      episodes,
      equipmentType: equipment_type,
      notes,
      items,
      user: req.user
    });

    await logActivity({
      actor: req.user,
      action: 'PAF_SAVED',
      entityType: 'PAF',
      entityId: paf._id,
      details: { estimated_total_paise: paf.estimated_total_paise },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      data: {
        id: paf._id,
        series_code: paf.series_code,
        estimated_total: toRupees(paf.estimated_total_paise),
        estimated_total_formatted: formatINR(paf.estimated_total_paise)
      },
      message: `PAF saved successfully. Total: ${formatINR(paf.estimated_total_paise)}`
    });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const pafs = await listPAFs(req.user.role);
    return res.status(200).json({
      success: true,
      data: pafs
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const isAccounts = req.user.role === ROLES.ACCOUNTS;
    const paf = await getPAFById(req.params.id, isAccounts);

    if (!paf) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'PAF record not found or not yet approved for Accounts review.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: paf
    });
  } catch (err) {
    next(err);
  }
}

async function getPrintView(req, res, next) {
  try {
    const isAccounts = req.user.role === ROLES.ACCOUNTS;
    const paf = await getPAFById(req.params.id, isAccounts);

    if (!paf) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'PAF not found or not approved.' }
      });
    }

    const html = `
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>PAF - ${paf.series_code}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111c3e; }
        .header { border-bottom: 2px solid #111c3e; padding-bottom: 20px; margin-bottom: 25px; }
        .disclaimer { background: #fff3cd; color: #856404; padding: 10px 15px; border-radius: 6px; font-size: 13px; font-weight: bold; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px 12px; font-size: 13px; }
        th { background: #f8fafc; font-weight: bold; text-align: left; }
        .total-row { font-weight: bold; font-size: 15px; background: #f1f5f9; }
        .footer { margin-top: 40px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
      </style>
    </head>
    <body>
      <div class="disclaimer">
        Approved estimated expenditure — not proof of payment. For internal production and accounts allocation only.
      </div>
      <div class="header">
        <h2>Sri Sankara TV — Production Approval Form (PAF)</h2>
        <div><strong>Series Reference:</strong> ${paf.series_code}</div>
        <div><strong>Show / Program:</strong> ${paf.show_name}</div>
        <div><strong>Location:</strong> ${paf.location}</div>
        <div><strong>Dates:</strong> ${paf.shoot_start} to ${paf.shoot_end}</div>
        <div><strong>Approved By:</strong> ${paf.snapshot_json?.approved_by || 'CMO'} (${paf.approved_at ? new Date(paf.approved_at).toLocaleString('en-IN') : 'Approved'})</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Particulars</th>
            <th>Unit</th>
            <th>Qty</th>
            <th>Unit Rate (₹)</th>
            <th style="text-align:right">Amount (₹)</th>
            <th>Payment Mode</th>
          </tr>
        </thead>
        <tbody>
          ${(paf.items || []).map(it => `
            <tr>
              <td>${it.particulars}</td>
              <td>${it.unit}</td>
              <td>${it.quantity}</td>
              <td>${formatINR(it.rate, false)}</td>
              <td style="text-align:right">${formatINR(it.amount, false)}</td>
              <td>${it.payment_mode}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="4">Total Estimated Expenditure</td>
            <td style="text-align:right">${formatINR(paf.estimated_total, false)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <div class="footer">
        Confidential Internal Document · Generated on ${new Date().toLocaleString('en-IN')} · Sri Sankara TV Broadcast Production Systems
      </div>
    </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  save,
  list,
  getById,
  getPrintView
};
