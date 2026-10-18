import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  Users,
  Clock,
  ShieldCheck,
  PlusCircle,
  FileCheck2,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VerificationBadge } from '../../components/ui/VerificationBadge';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';

export const EmployerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verification modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [regNumber, setRegNumber] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [supportInfo, setSupportInfo] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any>('/employers/dashboard');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/employers/verification', {
        registration_number: regNumber,
        org_website: orgWebsite,
        business_email: businessEmail,
        supporting_info: supportInfo,
      });
      setVerifySuccess('Verification details submitted! A platform administrator will review your corporate credentials.');
      fetchDashboard();
      setTimeout(() => {
        setShowVerifyModal(false);
        setVerifySuccess('');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit verification');
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading employer dashboard...</div>;
  }

  const { profile, metrics, recentApplications } = data || {};
  const isVerified = profile?.verification_status === 'verified';

  return (
    <div className="space-y-6">
      {/* Top Organization Header Card */}
      <Card className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-teal-400 bg-teal-950 px-2.5 py-0.5 rounded border border-teal-800">
                  Recruiter Console
                </span>
                <VerificationBadge status={profile?.verification_status} />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {profile?.org_name || 'My Organization'}
              </h1>
              <p className="text-xs text-slate-400 max-w-xl">
                {profile?.description || 'Hiring through skill-based matching and objective Trace practical assessments.'}
              </p>
            </div>

            <div className="flex gap-2">
              <Link to="/employer/jobs/new">
                <Button variant="teal" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
                  Post New Opening
                </Button>
              </Link>
              {!isVerified && (
                <Button variant="outline" size="md" onClick={() => setShowVerifyModal(true)}>
                  Submit Verification
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Status Banner if Not Verified */}
      {!isVerified && (
        <Alert variant="warning" title="Employer Verification Status: Action Recommended">
          Your organization is currently marked as <strong className="capitalize">{profile?.verification_status?.replace('_', ' ') || 'Unverified'}</strong>. Verified employers earn trust badges on listings, attracting 3x more qualified candidate applications.
          <div className="mt-2">
            <Button variant="primary" size="sm" onClick={() => setShowVerifyModal(true)}>
              Submit Corporate Verification Credentials
            </Button>
          </div>
        </Alert>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Active Listings</div>
            <div className="text-2xl font-extrabold text-slate-900">{metrics?.activeJobs || 0}</div>
            <div className="text-[11px] text-teal-600 font-semibold flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> Published openings
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Total Applicants</div>
            <div className="text-2xl font-extrabold text-slate-900">{metrics?.totalApplications || 0}</div>
            <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
              <Users className="w-3 h-3" /> Across all pipelines
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Awaiting Screening</div>
            <div className="text-2xl font-extrabold text-slate-900">{metrics?.awaitingReview || 0}</div>
            <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" /> Pending recruiter review
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Trace Evidence Ready</div>
            <div className="text-2xl font-extrabold text-slate-900">{metrics?.assessmentsAwaitingReview || 0}</div>
            <div className="text-[11px] text-purple-600 font-semibold flex items-center gap-1">
              <FileCheck2 className="w-3 h-3" /> Completed assessments
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications Pipeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Candidate Pipeline</CardTitle>
            <CardDescription className="text-xs">Applicants actively progressing through your hiring workflow.</CardDescription>
          </div>
          <Link to="/employer/analytics">
            <Button variant="outline" size="sm" leftIcon={<BarChart3 className="w-3.5 h-3.5" />}>
              Recruiter Analytics
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {recentApplications?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No applicants yet. Post a job to start receiving candidates.</div>
            ) : (
              recentApplications?.map((app: any) => (
                <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{app.candidate_name}</div>
                    <div className="text-xs text-slate-500">{app.job_title} • {app.candidate_headline}</div>
                    <span className="text-[11px] text-slate-400">Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="info" size="sm" className="capitalize">
                      {app.status.replace('_', ' ')}
                    </Badge>

                    {app.assessment_session_id && (
                      <Link to={`/trace/report/${app.assessment_session_id}`}>
                        <Button variant="outline" size="sm">
                          Inspect Evidence Report
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Submit Organization Verification"
        description="Provide corporate registration and business email credentials for moderator review."
      >
        {verifySuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900">Verification Under Review</h4>
            <p className="text-xs text-slate-500">{verifySuccess}</p>
          </div>
        ) : (
          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Registration Number</label>
              <input
                type="text"
                required
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. US-DEL-2021-998812 or UK-CO-1234567"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Domain Email</label>
              <input
                type="email"
                required
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                placeholder="careers@company.com"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Website URL</label>
              <input
                type="url"
                value={orgWebsite}
                onChange={(e) => setOrgWebsite(e.target.value)}
                placeholder="https://company.com"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supporting Verification Evidence</label>
              <textarea
                rows={2}
                value={supportInfo}
                onChange={(e) => setSupportInfo(e.target.value)}
                placeholder="Mention business registration registry link or enterprise email domain verification notes..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowVerifyModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="teal" size="sm">
                Submit for Audit
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
