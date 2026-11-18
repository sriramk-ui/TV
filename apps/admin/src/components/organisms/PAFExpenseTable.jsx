import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Select from '../atoms/Select';
import { formatINR, toPaise, toRupees } from '@sankara/shared';
import { PAYMENT_MODES } from '@sankara/constants';

export default function PAFExpenseTable({
  items = [],
  onChange,
  readOnly = false
}) {
  const handleItemChange = (index, field, value) => {
    if (readOnly) return;
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // Automatic calculation of amount
    const qty = Number(field === 'quantity' ? value : item.quantity) || 0;
    const rate = Number(field === 'rate' ? value : item.rate) || 0;
    const ratePaise = toPaise(rate);
    const amountPaise = Math.round(qty * ratePaise);

    item.amount_paise = amountPaise;
    item.amount = toRupees(amountPaise);
    updated[index] = item;
    onChange(updated);
  };

  const handleAddRow = () => {
    if (readOnly) return;
    onChange([
      ...items,
      {
        particulars: '',
        unit: 'Days',
        quantity: 1,
        rate: 0,
        amount: 0,
        amount_paise: 0,
        payment_mode: PAYMENT_MODES.CASH
      }
    ]);
  };

  const handleRemoveRow = (index) => {
    if (readOnly || items.length <= 1) return;
    const updated = items.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const grandTotalPaise = items.reduce(
    (acc, it) => acc + (it.amount_paise || toPaise(it.amount || 0)),
    0
  );

  return (
    <div className="space-y-4">
      <div className="border border-slate-200 rounded-brand-md overflow-hidden bg-white shadow-xs">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <th className="px-4 py-3 min-w-[200px]">Particulars</th>
              <th className="px-3 py-3 w-28">Unit</th>
              <th className="px-3 py-3 w-24">Qty</th>
              <th className="px-3 py-3 w-32">Rate (₹)</th>
              <th className="px-4 py-3 w-36 text-right">Amount (₹)</th>
              <th className="px-3 py-3 w-36">Payment</th>
              {!readOnly && <th className="px-3 py-3 w-12"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="p-2.5">
                  <Input
                    value={item.particulars}
                    disabled={readOnly}
                    onChange={(e) => handleItemChange(idx, 'particulars', e.target.value)}
                    placeholder="e.g. OB Van Diesel / Crew Food"
                    className="h-9 text-xs"
                    required
                  />
                </td>
                <td className="p-2.5">
                  <Input
                    value={item.unit || 'Days'}
                    disabled={readOnly}
                    onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                    placeholder="Days/Hrs"
                    className="h-9 text-xs"
                  />
                </td>
                <td className="p-2.5">
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    disabled={readOnly}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </td>
                <td className="p-2.5">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    disabled={readOnly}
                    onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                    className="h-9 text-xs text-right font-mono"
                    required
                  />
                </td>
                <td className="p-2.5 text-right font-mono font-bold text-slate-900 text-sm">
                  {formatINR(item.amount_paise || toPaise(item.amount || 0))}
                </td>
                <td className="p-2.5">
                  <Select
                    value={item.payment_mode || PAYMENT_MODES.CASH}
                    disabled={readOnly}
                    onChange={(e) => handleItemChange(idx, 'payment_mode', e.target.value)}
                    className="h-9 text-xs py-1"
                  >
                    {Object.values(PAYMENT_MODES).map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </Select>
                </td>
                {!readOnly && (
                  <td className="p-2.5 text-center">
                    <button
                      type="button"
                      disabled={items.length <= 1}
                      onClick={() => handleRemoveRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Remove Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-brand-md">
        {!readOnly ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            icon={Plus}
            onClick={handleAddRow}
          >
            Add Expense Row
          </Button>
        ) : <div />}

        <div className="flex items-center gap-4 text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Estimated Total
          </span>
          <strong className="text-2xl font-bold tracking-tight text-deep font-mono">
            {formatINR(grandTotalPaise)}
          </strong>
        </div>
      </div>
    </div>
  );
}
