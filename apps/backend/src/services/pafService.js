const PAF = require('../models/PAF');
const ShootRequest = require('../models/ShootRequest');
const { calculateLineAmountPaise, calculatePAFGrandTotalPaise, toRupees } = require('@sankara/shared');
const { PAF_STATUS } = require('@sankara/constants');

/**
 * Creates or updates a PAF draft.
 */
async function savePAF({
  id = null,
  shootId,
  showName,
  shootStart,
  shootEnd,
  location,
  episodes = 1,
  equipmentType = 'In-house',
  notes = '',
  items = [],
  user
}) {
  const shoot = await ShootRequest.findById(shootId);
  if (!shoot) {
    throw new Error('Associated EP shoot request not found.');
  }

  // Decimal-safe calculations
  const processedItems = items.map((it) => {
    const qty = Number(it.quantity) || 0;
    const rate = Number(it.rate) || 0;
    const ratePaise = Math.round(rate * 100);
    const amountPaise = calculateLineAmountPaise(qty, rate);

    return {
      particulars: it.particulars || 'Expense item',
      unit: it.unit || 'Days',
      quantity: qty,
      rate_paise: ratePaise,
      amount_paise: amountPaise,
      payment_mode: it.payment_mode || 'Cash'
    };
  });

  const grandTotalPaise = calculatePAFGrandTotalPaise(processedItems);

  let paf;
  if (id) {
    paf = await PAF.findById(id);
    if (!paf) throw new Error('PAF record not found');
    if (paf.status === PAF_STATUS.APPROVED) {
      throw new Error('Approved PAF records are locked against direct mutation.');
    }
  } else {
    paf = await PAF.findOne({ shoot_id: shoot._id });
    if (!paf) {
      paf = new PAF({
        shoot_id: shoot._id,
        series_code: shoot.series_code,
        created_by: user._id
      });
    }
  }

  paf.show_name = showName || shoot.title;
  paf.shoot_start = shootStart;
  paf.shoot_end = shootEnd;
  paf.location = location;
  paf.episodes = episodes;
  paf.equipment_type = equipmentType;
  paf.notes = notes;
  paf.items = processedItems;
  paf.estimated_total_paise = grandTotalPaise;
  if (!paf.status || paf.status === PAF_STATUS.CHANGES_REQUESTED) {
    paf.status = PAF_STATUS.DRAFT;
  }

  await paf.save();

  // Link to ShootRequest
  if (!shoot.paf_id) {
    shoot.paf_id = paf._id;
    await shoot.save();
  }

  return paf;
}

/**
 * Retrieves PAF by ID with formatted rupee fields for UI consumption.
 */
async function getPAFById(id, isAccounts = false) {
  const paf = await PAF.findById(id).populate('created_by', 'name email');
  if (!paf) return null;

  if (isAccounts && paf.status !== PAF_STATUS.APPROVED) {
    return null; // Accounts can never view pre-approval PAFs
  }

  const pafObj = paf.toObject();
  pafObj.estimated_total = toRupees(pafObj.estimated_total_paise);
  pafObj.items = pafObj.items.map((it) => ({
    ...it,
    rate: toRupees(it.rate_paise),
    amount: toRupees(it.amount_paise)
  }));

  return pafObj;
}

/**
 * Retrieves all PAFs visible to the current role.
 */
async function listPAFs(role) {
  const query = {};
  if (role === 'accounts') {
    query.status = PAF_STATUS.APPROVED;
  }

  const list = await PAF.find(query).sort({ created_at: -1 });
  return list.map((paf) => {
    const obj = paf.toObject();
    obj.estimated_total = toRupees(obj.estimated_total_paise);
    return obj;
  });
}

module.exports = {
  savePAF,
  getPAFById,
  listPAFs
};
