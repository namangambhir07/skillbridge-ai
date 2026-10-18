import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Award,
  Filter
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';

export const JobApplicantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // jobId
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Selected candidate modal
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Status update
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);

  // Feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackAppId, setFeedbackAppId] = useState<string | null>(null);
  const [strengths, setStrengths] = useState('');
  const [skillGaps, setSkillGaps] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [miniProjectTitle, setMiniProjectTitle] = useState('');
  const [miniProjectObjective, setMiniProjectObjective] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const fetchApplicants = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any>(`/employers/jobs/${id}/applicants`);
      setJob(res.job);
      setApplicants(res.applicants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [id]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setUpdatingAppId(appId);
    try {
      await api.patch(`/employers/applications/${appId}/status`, { status: newStatus });
      setApplicants((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackAppId) return;
    try {
      const gaps = skillGaps.split(',').map((s) => s.trim()).filter(Boolean);
      await api.post(`/applications/${feedbackAppId}/feedback`, {
        strengths,
        skill_gaps: gaps,
        feedback_message: feedbackMessage,
        can_reapply: true,
        mini_project: miniProjectTitle
          ? {
              title: miniProjectTitle,
              skill_name: gaps[0] || 'Technical Skill',
              objective: miniProjectObjective || 'Demonstrate hands-on practical competence.',
            }
          : undefined,
      });

      setFeedbackSuccess('Feedback and mini-project successfully assigned!');
      fetchApplicants();
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackSuccess('');
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    }
  };

  const filteredApplicants = statusFilter
    ? applicants.filter((a) => a.status === statusFilter)
    : applicants;

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading applicants pipeline...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link to="/employer/jobs" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to all jobs
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Applicants: {job?.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {applicants.length} total candidates • Sorted by explainable match alignment and Trace evidence.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="">All Application Statuses</option>
            <option value="applied">Applied</option>
            <option value="assessment_submitted">Assessment Submitted</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="improvement_suggested">Improvement Suggested</option>
            <option value="selected">Selected</option>
          </select>
        </div>
      </div>

      {/* Applicants Table */}
      {filteredApplicants.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-bold text-slate-800">No applicants found</div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplicants.map((app) => (
            <Card key={app.id} className="hover:border-slate-300 transition-all shadow-xs">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Candidate Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCandidate(app);
                          setShowProfileModal(true);
                        }}
                        className="font-bold text-base text-slate-900 hover:text-teal-600 transition-colors text-left"
                      >
                        {app.candidate_name}
                      </button>
                      <Badge variant="outline" size="sm">{app.candidate_email}</Badge>
                      {app.reapplication_count > 0 && (
                        <Badge variant="teal" size="sm">
                          Reapplication #{app.reapplication_count}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1">{app.headline}</p>

                    {/* Match reasoning pill */}
                    {app.match && (
                      <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-100 text-xs text-teal-950 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-teal-900">{app.match.overallScore}% Match</span>
                          <span className="font-semibold text-[11px] text-teal-800">• {app.match.recommendationLevel}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-1">{app.match.explanation}</p>
                      </div>
                    )}
                  </div>

                  {/* Assessment Status & Actions */}
                  <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2">
                      {/* Application status select */}
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={updatingAppId === app.id}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 capitalize focus:outline-none"
                      >
                        <option value="applied">Applied</option>
                        <option value="under_review">Under Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="improvement_suggested">Improvement Suggested</option>
                        <option value="selected">Selected / Offer</option>
                        <option value="rejected">Not Selected</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      {app.assessment_session_id ? (
                        <Link to={`/trace/report/${app.assessment_session_id}`}>
                          <Button variant="teal" size="sm" leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}>
                            Inspect Evidence Report
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Assessment not yet submitted</span>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFeedbackAppId(app.id);
                          setShowFeedbackModal(true);
                        }}
                      >
                        Give Feedback
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Candidate Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title={selectedCandidate?.candidate_name || 'Candidate Profile'}
        description={selectedCandidate?.headline || 'Profile Overview'}
      >
        <div className="space-y-4 text-xs">
          <div>
            <strong className="text-slate-900 block mb-0.5">Bio / Summary:</strong>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {selectedCandidate?.bio || 'No bio provided.'}
            </p>
          </div>

          <div>
            <strong className="text-slate-900 block mb-1">Demonstrated Candidate Skills:</strong>
            <div className="flex flex-wrap gap-1.5">
              {selectedCandidate?.candidateSkills?.map((s: any, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                  {s.name} ({s.proficiency_level})
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 text-slate-600">
            {selectedCandidate?.portfolio_url && (
              <div><strong>Portfolio:</strong> <a href={selectedCandidate.portfolio_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{selectedCandidate.portfolio_url}</a></div>
            )}
            {selectedCandidate?.github_url && (
              <div><strong>GitHub:</strong> <a href={selectedCandidate.github_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{selectedCandidate.github_url}</a></div>
            )}
          </div>
        </div>
      </Modal>

      {/* Constructive Feedback & Mini-Project Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Constructive Feedback & Mini-Project Assignment"
        description="Help the candidate identify exact skill gaps and assign a practical project for reapplication."
      >
        {feedbackSuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900">Feedback Dispatched!</h4>
            <p className="text-xs text-slate-500">{feedbackSuccess}</p>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Observed Strengths</label>
              <textarea
                rows={2}
                required
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="e.g. Strong React fundamentals, clean state reasoning..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Skill Gaps (comma-separated)</label>
              <input
                type="text"
                required
                value={skillGaps}
                onChange={(e) => setSkillGaps(e.target.value)}
                placeholder="e.g. Node.js In-Memory Caching, SQL Indexing"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback Message to Candidate</label>
              <textarea
                rows={3}
                required
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Explain constructively how completing the project will qualify them for reapplication..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 space-y-2">
              <span className="text-xs font-bold text-teal-950 block">Recommend Practical Mini-Project</span>
              <input
                type="text"
                value={miniProjectTitle}
                onChange={(e) => setMiniProjectTitle(e.target.value)}
                placeholder="Mini-project title (e.g. In-Memory LRU Cache with TTL)"
                className="w-full p-2 bg-white border border-teal-200 rounded-lg text-xs focus:outline-none"
              />
              <textarea
                rows={2}
                value={miniProjectObjective}
                onChange={(e) => setMiniProjectObjective(e.target.value)}
                placeholder="Objective and acceptance criteria for candidate..."
                className="w-full p-2 bg-white border border-teal-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowFeedbackModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="teal" size="sm">
                Dispatch Feedback
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
