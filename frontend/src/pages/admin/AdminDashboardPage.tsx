import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Building2,
  Users,
  Briefcase
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Verification decision modal
  const [selectedVer, setSelectedVer] = useState<any>(null);
  const [showVerModal, setShowVerModal] = useState(false);
  const [verDecision, setVerDecision] = useState<'verified' | 'rejected' | 'additional_info_required'>('verified');
  const [verNotes, setVerNotes] = useState('');

  // Report decision modal
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportStatus, setReportStatus] = useState<'action_taken' | 'dismissed' | 'under_review'>('action_taken');
  const [reportNotes, setReportNotes] = useState('');
  const [suspendJob, setSuspendJob] = useState(true);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, verRes, repRes, logsRes] = await Promise.all([
        api.get<any>('/admin/stats'),
        api.get<any>('/admin/verifications'),
        api.get<any>('/admin/reports'),
        api.get<any>('/admin/audit-logs'),
      ]);
      setStats(statsRes);
      setVerifications(verRes.verifications || []);
      setReports(repRes.reports || []);
      setAuditLogs(logsRes.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerificationDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVer) return;
    try {
      await api.patch(`/admin/verifications/${selectedVer.id}`, {
        status: verDecision,
        reviewer_notes: verNotes,
      });
      setShowVerModal(false);
      setVerNotes('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit verification decision');
    }
  };

  const handleReportModeration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      await api.patch(`/admin/reports/${selectedReport.id}`, {
        status: reportStatus,
        moderator_notes: reportNotes,
        suspend_job: suspendJob,
      });
      setShowReportModal(false);
      setReportNotes('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to moderate report');
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading moderation queue...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="space-y-2">
          <Badge variant="danger">Platform Moderation Console</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Trust, Verification & Safety Moderation
          </h1>
          <p className="text-sm text-slate-300">
            Audit employer legal verification claims, adjudicate suspicious job reports, and inspect system audit logs.
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Pending Verifications</div>
            <div className="text-2xl font-extrabold text-amber-600">{stats?.pendingVerifications || 0}</div>
            <div className="text-[11px] text-slate-400">Employer claims</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Open Reports</div>
            <div className="text-2xl font-extrabold text-rose-600">{stats?.openReports || 0}</div>
            <div className="text-[11px] text-slate-400">Suspicious listings</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Trace Assessments</div>
            <div className="text-2xl font-extrabold text-teal-600">{stats?.completedAssessments || 0}</div>
            <div className="text-[11px] text-slate-400">Evaluated sessions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Accepted Mini-Projects</div>
            <div className="text-2xl font-extrabold text-emerald-600">{stats?.completedMiniProjects || 0}</div>
            <div className="text-[11px] text-slate-400">Verified evidence</div>
          </CardContent>
        </Card>
      </div>

      {/* 1. Employer Verification Audit Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            Employer Verification Review Queue
          </CardTitle>
          <CardDescription className="text-xs">
            Review corporate entity credentials before granting verified employer status.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {verifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No verification submissions found.</div>
            ) : (
              verifications.map((ver) => (
                <div key={ver.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-slate-900">{ver.org_name}</strong>
                      <Badge
                        variant={
                          ver.status === 'verified'
                            ? 'success'
                            : ver.status === 'pending_review'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {ver.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-500 space-y-0.5">
                      <div>Registration ID: <span className="font-mono text-slate-800">{ver.registration_number || 'N/A'}</span></div>
                      <div>Website: <span className="text-blue-600">{ver.org_website || 'None'}</span> • Email: <span className="text-slate-700">{ver.business_email || 'None'}</span></div>
                    </div>

                    {ver.supporting_info && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                        "{ver.supporting_info}"
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedVer(ver);
                        setShowVerModal(true);
                      }}
                    >
                      Audit & Decide
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. Suspicious Job Reports Adjudication */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            Suspicious Job Reports & Allegations
          </CardTitle>
          <CardDescription className="text-xs">
            Review user-submitted reports regarding potential fee scams, phishing, or policy violations.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {reports.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No open job reports.</div>
            ) : (
              reports.map((rep) => (
                <div key={rep.id} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="danger" size="sm">{rep.category.toUpperCase()}</Badge>
                      <strong className="text-sm text-slate-900">{rep.job_title}</strong>
                      <span className="text-xs text-slate-400">({rep.org_name})</span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      "{rep.description}"
                    </p>

                    {rep.evidence_notes && (
                      <div className="text-[11px] text-slate-600 bg-rose-50/60 p-2 rounded border border-rose-100">
                        <strong>Evidence Quoted:</strong> {rep.evidence_notes}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400">
                      Reported by {rep.reporter_name} ({rep.reporter_email}) • {new Date(rep.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Badge variant={rep.status === 'open' ? 'warning' : 'outline'} size="sm">
                      {rep.status.toUpperCase()}
                    </Badge>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(rep);
                        setShowReportModal(true);
                      }}
                    >
                      Adjudicate
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Audit Logs Trail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-slate-600" />
            System Audit Trail
          </CardTitle>
          <CardDescription className="text-xs">Immutable record of administrative moderation decisions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-800 capitalize">{log.action.replace('_', ' ')}</span>
                  <div className="text-slate-500 text-[11px]">{log.details}</div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verification Decision Modal */}
      <Modal
        isOpen={showVerModal}
        onClose={() => setShowVerModal(false)}
        title={`Audit Verification: ${selectedVer?.org_name}`}
        description="Verify corporate registration before updating public status."
      >
        <form onSubmit={handleVerificationDecision} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Decision</label>
            <select
              value={verDecision}
              onChange={(e) => setVerDecision(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
            >
              <option value="verified">Approve (Mark as Verified Employer)</option>
              <option value="additional_info_required">Request Additional Documentation</option>
              <option value="rejected">Reject Verification</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reviewer Reason and Audit Notes</label>
            <textarea
              rows={3}
              required
              value={verNotes}
              onChange={(e) => setVerNotes(e.target.value)}
              placeholder="Record explicit reason for approval or rejection..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowVerModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm">
              Confirm Decision
            </Button>
          </div>
        </form>
      </Modal>

      {/* Report Moderation Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title={`Adjudicate Report: ${selectedReport?.job_title}`}
        description="Every report is an allegation requiring objective evidence-based review."
      >
        <form onSubmit={handleReportModeration} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Moderation Verdict</label>
            <select
              value={reportStatus}
              onChange={(e) => setReportStatus(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
            >
              <option value="action_taken">Action Taken (Flag or Suspend Listing)</option>
              <option value="under_review">Mark Under Active Investigation</option>
              <option value="dismissed">Dismiss Report (No Violation Found)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-rose-50 rounded-lg border border-rose-200">
            <input
              type="checkbox"
              id="suspendJob"
              checked={suspendJob}
              onChange={(e) => setSuspendJob(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
            />
            <label htmlFor="suspendJob" className="text-xs font-bold text-rose-900 select-none">
              Suspend / Deactivate Job Listing Immediately
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Moderator Audit Notes</label>
            <textarea
              rows={3}
              required
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="Record findings from inspection..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm">
              Apply Moderation Action
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
