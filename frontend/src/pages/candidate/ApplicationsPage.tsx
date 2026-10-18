import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  Building2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../lib/api';
import { Application } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';

export const CandidateApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Reapply modal
  const [showReapplyModal, setShowReapplyModal] = useState(false);
  const [reapplyNote, setReapplyNote] = useState('');
  const [reapplySuccess, setReapplySuccess] = useState('');

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ applications: Application[] }>('/candidates/me/applications');
      setApplications(res.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleReapply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      const res = await api.post<any>(`/applications/${selectedApp.id}/reapply`, {
        note: reapplyNote,
      });
      setReapplySuccess(res.message || 'Reapplication submitted successfully!');
      fetchApplications();
      setTimeout(() => {
        setShowReapplyModal(false);
        setReapplySuccess('');
        setReapplyNote('');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to reapply');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selected':
        return <Badge variant="success">Selected / Offer</Badge>;
      case 'shortlisted':
        return <Badge variant="teal">Shortlisted</Badge>;
      case 'improvement_suggested':
        return <Badge variant="purple">Improvement Suggested</Badge>;
      case 'assessment_required':
        return <Badge variant="warning">Assessment Required</Badge>;
      case 'assessment_submitted':
        return <Badge variant="info">Assessment Submitted</Badge>;
      case 'under_review':
        return <Badge variant="info">Under Review</Badge>;
      case 'rejected':
        return <Badge variant="danger">Not Selected</Badge>;
      default:
        return <Badge variant="default">{status.replace('_', ' ')}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Application Tracker
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your active candidacy pipelines, review Trace assessments, and manage evidence-based reapplications.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading applications...</div>
      ) : applications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800">No active applications yet</h3>
            <p className="text-xs text-slate-500">Explore open opportunities and submit your profile.</p>
            <Link to="/jobs">
              <Button variant="teal" size="sm">
                Explore Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="hover:border-slate-300 transition-all shadow-xs">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/jobs/${app.job_id}`} className="font-bold text-base text-slate-900 hover:text-blue-600">
                        {app.job_title}
                      </Link>
                      {getStatusBadge(app.status)}
                      {app.reapplication_count > 0 && (
                        <Badge variant="teal" size="sm">
                          Reapplication #{app.reapplication_count}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {app.org_name}
                      </span>
                      <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(app.updated_at).toLocaleDateString()}</span>
                    </div>

                    {/* Status helper callout */}
                    {app.status === 'assessment_required' && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                        <span>Please complete the Trace assessment scenario to advance your candidacy.</span>
                        <Link to={`/trace/assessment/asm_nexus_fs`}>
                          <Button variant="primary" size="sm">
                            Take Assessment
                          </Button>
                        </Link>
                      </div>
                    )}

                    {app.status === 'improvement_suggested' && (
                      <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
                        <span>The employer provided growth feedback & recommended a mini-project for reapplication.</span>
                        <div className="flex gap-2">
                          <Link to="/candidate/growth">
                            <Button variant="teal" size="sm">
                              Growth Hub & Mini-Project
                            </Button>
                          </Link>
                          {app.can_reapply === 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApp(app);
                                setShowReapplyModal(true);
                              }}
                            >
                              Reapply Now
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedApp(app);
                        setShowHistoryModal(true);
                      }}
                    >
                      Status History ({app.history?.length || 0})
                    </Button>

                    {app.assessment_session_id && (
                      <Link to={`/trace/report/${app.assessment_session_id}`}>
                        <Button variant="ghost" size="sm" className="text-teal-700 hover:text-teal-800">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                          Evidence Report
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* History Timeline Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title={`Application Timeline: ${selectedApp?.job_title}`}
        description="Immutable audit trail of application state changes."
      >
        <div className="space-y-4 text-xs">
          {selectedApp?.history && selectedApp.history.map((h, idx) => (
            <div key={h.id || idx} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 capitalize">{h.status.replace('_', ' ')}</span>
                  <span className="text-[10px] text-slate-400">{new Date(h.created_at).toLocaleString()}</span>
                </div>
                {h.notes && <p className="text-slate-600">{h.notes}</p>}
                {h.changed_by_name && (
                  <span className="text-[10px] text-slate-400">By: {h.changed_by_name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Reapply Modal */}
      <Modal
        isOpen={showReapplyModal}
        onClose={() => setShowReapplyModal(false)}
        title={`Reapply with Evidence: ${selectedApp?.job_title}`}
        description="Submit a new application referencing your verified completed mini-projects."
      >
        {reapplySuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900">Reapplication Submitted!</h4>
            <p className="text-xs text-slate-500">{reapplySuccess}</p>
          </div>
        ) : (
          <form onSubmit={handleReapply} className="space-y-4">
            <Alert variant="info">
              Reapplying submits your profile along with all newly accepted mini-project evidence directly to the recruiter's priority queue.
            </Alert>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Candidate Note to Recruiter
              </label>
              <textarea
                rows={3}
                required
                value={reapplyNote}
                onChange={(e) => setReapplyNote(e.target.value)}
                placeholder="Describe the skills and practical project evidence you have completed since your previous application..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowReapplyModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="teal" size="sm">
                Confirm Reapplication
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export const ApplicationsPage = CandidateApplicationsPage;
