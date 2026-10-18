import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VerificationBadge } from '../../components/ui/VerificationBadge';
import { Alert } from '../../components/ui/Alert';

export const VerificationPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regNumber, setRegNumber] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [supportingInfo, setSupportingInfo] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchVerificationStatus = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any>('/employers/dashboard');
      if (res?.profile) {
        setProfile(res.profile);
        setRegNumber(res.profile.registration_number || '');
        setOrgWebsite(res.profile.org_website || '');
        setBusinessEmail(res.profile.business_email || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      await api.post('/employers/verification', {
        registration_number: regNumber,
        org_website: orgWebsite,
        business_email: businessEmail,
        supporting_info: supportingInfo,
      });
      setStatusMessage({
        type: 'success',
        text: 'Verification application submitted successfully! Platform moderators will review your company registration and corporate domain.',
      });
      fetchVerificationStatus();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to submit verification information.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-600 font-medium">Loading organization verification status...</p>
      </div>
    );
  }

  const status = profile?.verification_status || 'not_submitted';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-200">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Organization Verification</h1>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          SkillBridge AI enforces authentic corporate identity verification. Verified employers receive trusted badges, higher job discovery rank, and access to Trace candidate evidence reports.
        </p>
      </div>

      {statusMessage && (
        <Alert variant={statusMessage.type === 'success' ? 'success' : 'error'}>
          {statusMessage.text}
        </Alert>
      )}

      {/* Current Status Overview Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification Status</span>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{profile?.org_name || 'Organization'}</h2>
              <VerificationBadge status={status} />
            </div>
            <p className="text-xs text-slate-500">
              {status === 'verified'
                ? 'Your organization is verified by platform administrators. Your listings show verified trust badges.'
                : status === 'pending_review'
                ? 'Your verification submission is currently in the platform administrator moderation queue.'
                : status === 'additional_info_required'
                ? 'The reviewer requested additional proof of legal entity or corporate domain ownership.'
                : 'Your organization has not yet completed verification. Submit corporate credentials below.'}
            </p>
          </div>

          {status === 'verified' && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Full Employer Privileges Active</span>
            </div>
          )}
        </div>

        {profile?.reviewer_notes && (
          <div className="mt-4 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            <span className="font-bold block mb-1">Reviewer Feedback:</span>
            {profile.reviewer_notes}
          </div>
        )}
      </Card>

      {/* Submission Form */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg">
            {status === 'verified' ? 'Update Corporate Information' : 'Submit Corporate Verification Credentials'}
          </CardTitle>
          <CardDescription className="text-xs">
            Provide verifiable business registration details and an official work email address matching your corporate domain.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Business Registration / CIN / Tax ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. CIN: U72200KA2021PTC145678 or EIN"
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Corporate Website <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                value={orgWebsite}
                onChange={(e) => setOrgWebsite(e.target.value)}
                placeholder="https://nexuscloud.io"
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Authorized Business Work Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              placeholder="recruitment@nexuscloud.io"
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-brand-primary focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Public free email domains (e.g. @gmail.com) may require extra proof of corporate authority.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supporting Proof / Registrar Link / Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={supportingInfo}
              onChange={(e) => setSupportingInfo(e.target.value)}
              placeholder="e.g. Link to corporate registrar listing, MCA portal record, or official LinkedIn company page..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <Button type="submit" isLoading={isSubmitting} className="gap-2">
              <ShieldCheck className="w-4 h-4" />
              {status === 'verified' ? 'Update & Re-verify' : 'Submit for Admin Review'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Verification Policy Information */}
      <Card className="p-5 bg-slate-50/70 border-slate-200 text-xs text-slate-600 space-y-2">
        <span className="font-bold text-slate-800 block">Trust & Verification Policy:</span>
        <p>
          1. <strong>Deterministic Audit:</strong> SkillBridge AI does not manufacture fake verified badges. Every verification decision is permanently logged in the system audit trail.
        </p>
        <p>
          2. <strong>Candidate Safety:</strong> Unverified employers can publish listings with a "Community Listing (Unverified)" disclosure, but are subject to rule-based screening and community reporting.
        </p>
        <p>
          3. <strong>Trace Evidence Access:</strong> Only verified employers or employers under active review can request and inspect detailed candidate Trace telemetry and dynamic adaptation rubrics.
        </p>
      </Card>
    </div>
  );
};
