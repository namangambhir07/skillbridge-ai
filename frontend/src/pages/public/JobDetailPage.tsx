import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Send,
  Flag,
  Globe,
  Mail
} from 'lucide-react';
import { api } from '../../lib/api';
import { Job } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { VerificationBadge } from '../../components/ui/VerificationBadge';
import { Modal } from '../../components/ui/Modal';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Report Modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState('suspicious_employer');
  const [reportDesc, setReportDesc] = useState('');
  const [reportEvidence, setReportEvidence] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api.get<{ job: any }>(`/jobs/${id}`)
      .then((res) => {
        setJob(res.job);
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Failed to load opportunity details');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'candidate') {
      setErrorMsg('Only candidate accounts can apply for job openings.');
      return;
    }

    setIsApplying(true);
    setErrorMsg('');
    try {
      const res = await api.post<any>(`/jobs/${id}/apply`);
      setApplySuccess(res);
      // Refresh job state
      const refreshed = await api.get<{ job: any }>(`/jobs/${id}`);
      setJob(refreshed.job);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/jobs/${id}/reports`, {
        category: reportCategory,
        description: reportDesc,
        evidence_notes: reportEvidence,
      });
      setReportSubmitted(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSubmitted(false);
        setReportDesc('');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading opportunity details...</div>;
  }

  if (!job) {
    return (
      <div className="py-12 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Opportunity not found</h2>
        <Link to="/jobs"><Button variant="outline" size="sm">Back to Jobs</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all opportunities
        </Link>
      </div>

      {errorMsg && (
        <Alert variant="error" title="Notice">
          {errorMsg}
        </Alert>
      )}

      {applySuccess && (
        <Alert variant="success" title="Application Initiated!">
          {applySuccess.message}
          {applySuccess.assessmentSessionId && (
            <div className="mt-2">
              <Link to={`/trace/assessment/${job.assessment?.id || 'asm_nexus_fs'}`}>
                <Button variant="teal" size="sm">
                  Start Trace Practical Assessment Now
                </Button>
              </Link>
            </div>
          )}
        </Alert>
      )}

      {/* Hero Header Card */}
      <Card>
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={job.opportunity_type === 'internship' ? 'purple' : 'info'} size="md">
                  {job.opportunity_type.toUpperCase()}
                </Badge>
                <VerificationBadge status={job.verification_status} />
                <Badge variant="outline">{job.category}</Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-5 text-sm text-slate-600">
                <span className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {job.org_name}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.location} ({job.work_mode})
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {job.experience_level}
                </span>
                {job.salary_range && (
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    {job.salary_range}
                  </span>
                )}
              </div>
            </div>

            {/* Action Box */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-3 shrink-0 min-w-[200px]">
              {job.application ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                  <div className="text-xs text-slate-500">Application Status</div>
                  <Badge variant="info" size="md" className="capitalize">
                    {job.application.status.replace('_', ' ')}
                  </Badge>
                  {job.application.status === 'assessment_required' && (
                    <div className="pt-1">
                      <Link to={`/trace/assessment/${job.assessment?.id || 'asm_nexus_fs'}`}>
                        <Button variant="teal" size="sm" className="w-full">
                          Take Assessment
                        </Button>
                      </Link>
                    </div>
                  )}
                  {job.application.status === 'improvement_suggested' && (
                    <div className="pt-1">
                      <Link to="/candidate/growth">
                        <Button variant="teal" size="sm" className="w-full">
                          View Mini-Project & Growth
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="teal"
                  size="lg"
                  onClick={handleApply}
                  isLoading={isApplying}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Apply with Skill Profile
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReportModal(true)}
                className="text-slate-400 hover:text-rose-600"
                leftIcon={<Flag className="w-3.5 h-3.5" />}
              >
                Report Suspicious Listing
              </Button>
            </div>
          </div>

          {/* Explainable Match Breakdown if Candidate */}
          {job.match && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 via-blue-50 to-indigo-50 border border-teal-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
                    Explainable Candidate Alignment
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-teal-900">{job.match.overallScore}%</span>
                  <Badge variant="teal" size="sm">{job.match.recommendationLevel}</Badge>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {job.match.explanation}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
                  <div className="text-slate-500">Required Skills</div>
                  <div className="font-bold text-slate-900">{job.match.breakdown.requiredScore}%</div>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
                  <div className="text-slate-500">Preferred Skills</div>
                  <div className="font-bold text-slate-900">{job.match.breakdown.preferredScore}%</div>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
                  <div className="text-slate-500">Projects / Exp</div>
                  <div className="font-bold text-slate-900">{job.match.breakdown.experienceScore}%</div>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
                  <div className="text-slate-500">Assessment Proof</div>
                  <div className="font-bold text-slate-900">{job.match.breakdown.assessmentScore}%</div>
                </div>
              </div>

              {job.match.missingRequiredSkills.length > 0 && (
                <div className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60">
                  <strong>Skill Gap Identified:</strong> Lacking evidence for {job.match.missingRequiredSkills.join(', ')}. If your application receives feedback, you can complete targeted mini-projects to qualify for reapplication.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Role Overview & Description */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm text-slate-700 leading-relaxed">
              <div className="whitespace-pre-line">{job.description}</div>

              {job.responsibilities && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">Key Responsibilities</h4>
                  <div className="whitespace-pre-line text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {job.responsibilities}
                  </div>
                </div>
              )}

              {job.eligibility_criteria && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">Eligibility & Background</h4>
                  <div className="whitespace-pre-line text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {job.eligibility_criteria}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trace Assessment Details */}
          {job.assessment && (
            <Card className="border-teal-200/80 bg-teal-50/20">
              <CardHeader className="bg-teal-50/50 border-b border-teal-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-teal-900 font-bold">
                    <ShieldCheck className="w-5 h-5 text-teal-600" />
                    Trace Practical Assessment Required
                  </div>
                  <Badge variant="teal" size="sm">{job.assessment.task_type.toUpperCase()}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3 text-xs text-slate-600">
                <div className="font-semibold text-slate-900 text-sm">{job.assessment.title}</div>
                <p>
                  This opportunity incorporates a practical Trace scenario. After submitting your initial solution, a dynamic constraint shift will evaluate real adaptability.
                </p>
                <div className="p-3 bg-white rounded-lg border border-teal-100 text-[11px] space-y-1">
                  <span className="font-bold text-slate-800">Time Limit:</span> {job.assessment.time_limit_minutes} minutes
                  <br />
                  <span className="font-bold text-slate-800">Telemetry:</span> Consensual, transparent activity context (timestamps, edits) reported objectively.
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (1 Col): Skills & Employer Info */}
        <div className="space-y-6">
          {/* Skills Required */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Target Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.requirements && job.requirements.map((req: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-800">{req.name}</span>
                  <Badge variant={req.is_required ? 'default' : 'outline'} size="sm">
                    {req.is_required ? 'Required' : 'Preferred'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Employer Profile & Trust */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About the Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <div className="font-bold text-slate-900 text-sm">{job.org_name}</div>
                <div className="mt-1"><VerificationBadge status={job.verification_status} /></div>
              </div>

              {job.org_description && (
                <p className="text-slate-600 leading-relaxed">{job.org_description}</p>
              )}

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-slate-500">
                {job.org_website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <a href={job.org_website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {job.org_website}
                    </a>
                  </div>
                )}
                {job.industry && <div><strong>Industry:</strong> {job.industry}</div>}
                {job.company_size && <div><strong>Team Size:</strong> {job.company_size}</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Report Listing Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Suspicious Opportunity"
        description="Every report is treated as an allegation requiring objective moderator review."
      >
        {reportSubmitted ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900">Report Received</h4>
            <p className="text-xs text-slate-500">Our moderation team will review this listing objectively.</p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Report</label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              >
                <option value="suspicious_employer">Suspicious employer identity</option>
                <option value="misleading_description">Misleading job description</option>
                <option value="fee_request">Requests payment or training deposit from applicants</option>
                <option value="scam_phishing">Potential scam or phishing</option>
                <option value="discriminatory">Discriminatory requirements</option>
                <option value="other">Other policy concern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Details & Context</label>
              <textarea
                rows={3}
                required
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                placeholder="Describe why you believe this listing violates safety guidelines..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Optional Evidence Quotes</label>
              <input
                type="text"
                value={reportEvidence}
                onChange={(e) => setReportEvidence(e.target.value)}
                placeholder="Direct quotes or links (e.g. fee amount, telegram handle)"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowReportModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm">
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
