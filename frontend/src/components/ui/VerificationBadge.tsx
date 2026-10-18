import React from 'react';
import { ShieldCheck, Clock, AlertCircle, ShieldAlert, Shield } from 'lucide-react';
import { Badge } from './Badge';

interface VerificationBadgeProps {
  status?: 'verified' | 'pending_review' | 'additional_info_required' | 'not_submitted' | 'rejected' | string;
  showIconOnly?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status = 'not_submitted', showIconOnly = false }) => {
  switch (status) {
    case 'verified':
      return (
        <Badge variant="teal" title="Independently verified corporate entity">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          {!showIconOnly && <span>Verified Employer</span>}
        </Badge>
      );
    case 'pending_review':
      return (
        <Badge variant="warning" title="Verification submission undergoing moderator review">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          {!showIconOnly && <span>Verification Pending</span>}
        </Badge>
      );
    case 'additional_info_required':
      return (
        <Badge variant="warning" title="Moderators requested additional documentation">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          {!showIconOnly && <span>Info Requested</span>}
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="danger" title="Verification rejected by platform moderators">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          {!showIconOnly && <span>Verification Rejected</span>}
        </Badge>
      );
    case 'not_submitted':
    default:
      return (
        <Badge variant="default" title="Unverified organization - review listing with care">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          {!showIconOnly && <span className="text-slate-500">Unverified</span>}
        </Badge>
      );
  }
};
