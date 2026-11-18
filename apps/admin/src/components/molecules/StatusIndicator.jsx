import React from 'react';
import Badge from '../atoms/Badge';

const STATUS_MAP = {
  requested: { label: 'Shoot Requested', variant: 'requested' },
  pending_approval: { label: 'Pending CMO', variant: 'pending_approval' },
  pending_cmo: { label: 'Pending CMO', variant: 'pending_cmo' },
  approved: { label: 'Approved', variant: 'approved' },
  changes_requested: { label: 'Changes Requested', variant: 'changes_requested' },
  cancelled: { label: 'Cancelled', variant: 'cancelled' },
  draft: { label: 'Draft', variant: 'draft' },
  acknowledged: { label: 'Acknowledged', variant: 'approved' },
  pending: { label: 'Pending', variant: 'requested' },
  conflict_reported: { label: 'Conflict Reported', variant: 'changes_requested' }
};

export default function StatusIndicator({ status, size = 'md', className = '' }) {
  const config = STATUS_MAP[status] || { label: status || 'Unknown', variant: 'default' };

  return (
    <Badge variant={config.variant} size={size} className={className}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      <span>{config.label}</span>
    </Badge>
  );
}
