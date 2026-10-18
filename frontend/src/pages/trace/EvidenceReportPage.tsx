import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';

export const EvidenceReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // sessionId
  const { user } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Employer feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [strengths, setStrengths] = useState('');
  const [skillGaps, setSkillGaps] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [learningResource, setLearningResource] = useState('');
  const [miniProjectTitle, setMiniProjectTitle] = useState('');
  const [miniProjectObjective, setMiniProjectObjective] = useState('');
  const [canReapply, setCanReapply] = useState(true);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any>(`/assessments/sessions/${id}/report`);
      setReport(res.report);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load evidence report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report?.session?.application_id) {
      alert('No linked application found to attach feedback');
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      const gapsArray = skillGaps.split(',').map((s) => s.trim()).filter(Boolean);
      await api.post(`/applications/${report.session.application_id}/feedback`, {
        strengths,
        skill_gaps: gapsArray,
        feedback_message: feedbackMessage,
        learning_resources: learningResource ? [learningResource] : [],
        can_reapply: canReapply,
        mini_project: miniProjectTitle
          ? {
              title: miniProjectTitle,
              skill_name: gapsArray[0] || 'Technical Skill',
              objective: miniProjectObjective || 'Demonstrate hands-on competence in this growth area.',
            }
          : undefined,
      });

      setFeedbackSuccess('Constructive feedback & mini-project dispatched to candidate!');
      fetchReport();
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackSuccess('');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Generating Trace Process Evidence Report...</div>;
  }

  if (!report || errorMsg) {
    return (
      <div className="py-12 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Report Not Available</h2>
        <p className="text-xs text-slate-500">{errorMsg || 'Could not locate session record.'}</p>
        <Link to="/"><Button variant="outline" size="sm">Go to Homepage</Button></Link>
      </div>
    );
  }

  const { session, initialSubmission, revisionSubmission, timeline, telemetrySummary, evaluation, feedback, disclaimerNotice } = report;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header Card */}
      <Card className="border-teal-200 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-teal-400 bg-teal-950 px-2.5 py-0.5 rounded border border-teal-800">
                  Trace Process Evidence Report
                </span>
                <Badge variant="teal" size="sm">Completed & Evaluated</Badge>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {session.assessment_title}
              </h1>
            </div>

            {/* Recruiter Action Button if logged in as Employer */}
            {user?.role === 'employer' && session.application_id && (
              <Button
                variant="teal"
                size="md"
                onClick={() => setShowFeedbackModal(true)}
                leftIcon={<MessageSquare className="w-4 h-4" />}
              >
                Provide Feedback & Mini-Project
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block text-[11px]">Candidate</span>
              <strong className="text-white text-sm">{session.candidate_name}</strong>
              <div className="text-[11px] text-slate-400">{session.candidate_headline}</div>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Target Role / Employer</span>
              <strong className="text-white text-sm">{session.job_title || 'General Assessment'}</strong>
              <div className="text-[11px] text-slate-400">{session.org_name || 'SkillBridge'}</div>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Duration Recorded</span>
              <strong className="text-white text-sm">{telemetrySummary.elapsedMinutes} mins ({telemetrySummary.elapsedSeconds}s)</strong>
              <div className="text-[11px] text-slate-400">Within 45m timebox</div>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Adaptation Score</span>
              <strong className="text-teal-400 text-sm">
                {evaluation ? `${Math.round(evaluation.addresses_requirement * 100)}/100` : 'Pending'}
              </strong>
              <div className="text-[11px] text-slate-400">Rubric Evaluated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mandatory Objective Observation Warning Banner */}
      <Alert variant="warning" title="Objective Telemetry Context, Not Accusations">
        {disclaimerNotice}
      </Alert>

      {/* Section G: Adaptation Evaluation & Rubric Breakdown */}
      {evaluation && (
        <Card className="border-teal-200/80 bg-teal-50/20">
          <CardHeader className="bg-teal-50/60 border-b border-teal-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-teal-950 flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" />
                Transparent Dynamic Adaptation Rubric
              </CardTitle>
              <CardDescription className="text-teal-700">
                Measures candidate response to the dynamic scenario constraint shift.
              </CardDescription>
            </div>
            <Badge variant="teal" size="md">
              Score: {Math.round(evaluation.addresses_requirement * 100)}%
            </Badge>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {evaluation.rubricBreakdown && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {evaluation.rubricBreakdown.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 bg-white rounded-xl border border-teal-100 space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{item.criterion}</span>
                      <span className="font-extrabold text-sm text-teal-700">{item.score}/100</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {item.observation}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {evaluation.feedback_summary && (
              <div className="p-3 bg-white rounded-xl border border-teal-100 text-xs text-slate-700">
                <strong className="text-slate-900">Summary: </strong>
                {evaluation.feedback_summary}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparison Grid: Initial Submission vs. Revised Submission */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Initial Submission */}
        <Card>
          <CardHeader className="bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800">Initial Response</CardTitle>
              <CardDescription className="text-[11px]">Primary scenario output</CardDescription>
            </div>
            <Badge variant="outline" size="sm">{initialSubmission?.content?.length || 0} chars</Badge>
          </CardHeader>
          <CardContent className="p-5">
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono whitespace-pre-line text-slate-800 leading-relaxed">
              {initialSubmission?.content || 'No submission record.'}
            </div>
          </CardContent>
        </Card>

        {/* Revised Submission & Explanation */}
        <Card className="border-teal-200/80">
          <CardHeader className="bg-teal-50/40 border-b border-teal-100 flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-teal-950">Revised Output (Adapted)</CardTitle>
              <CardDescription className="text-[11px] text-teal-700">Incorporating dynamic scenario shift</CardDescription>
            </div>
            <Badge variant="teal" size="sm">{revisionSubmission?.content?.length || 0} chars</Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono whitespace-pre-line text-slate-800 leading-relaxed">
              {revisionSubmission?.content || 'No revision submitted.'}
            </div>

            {revisionSubmission?.candidate_explanation && (
              <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-100 space-y-1">
                <div className="text-[11px] font-bold text-teal-900 uppercase tracking-wider">
                  Candidate Rationale Statement
                </div>
                <p className="text-xs text-slate-800 italic leading-relaxed">
                  "{revisionSubmission.candidate_explanation}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section E & F: Objective Activity Telemetry & Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Activity Telemetry & Timestamped Timeline</span>
            <span className="text-xs font-normal text-slate-500">
              {telemetrySummary.pasteCount} paste events • {telemetrySummary.editCount} editor updates
            </span>
          </CardTitle>
          <CardDescription>
            Audit log of consensual metadata logged during the assessment session.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center pb-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Observed Pastes</span>
              <strong className="text-lg font-extrabold text-slate-900">{telemetrySummary.pasteCount}</strong>
              <span className="text-[10px] text-slate-400 block">(Contextual observation)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Editor Changes</span>
              <strong className="text-lg font-extrabold text-slate-900">{telemetrySummary.editCount}</strong>
              <span className="text-[10px] text-slate-400 block">(Active drafting)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Total Elapsed Time</span>
              <strong className="text-lg font-extrabold text-slate-900">{telemetrySummary.elapsedMinutes} mins</strong>
              <span className="text-[10px] text-slate-400 block">({telemetrySummary.elapsedSeconds}s)</span>
            </div>
          </div>

          {/* Event Timeline Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider grid grid-cols-12 gap-2 border-b border-slate-200">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Event Type</div>
              <div className="col-span-5">Metadata Details</div>
              <div className="col-span-3 text-right">Timestamp</div>
            </div>
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto text-xs">
              {timeline.map((event: any) => {
                let metaObj: any = {};
                try { metaObj = JSON.parse(event.metadata); } catch { metaObj = {}; }

                return (
                  <div key={event.id} className="px-4 py-2.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-50">
                    <div className="col-span-1 text-slate-400 font-mono text-[11px]">{event.event_sequence}</div>
                    <div className="col-span-3 font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      {event.event_type.replace('_', ' ')}
                    </div>
                    <div className="col-span-5 text-slate-500 truncate text-[11px] font-mono">
                      {event.metadata}
                    </div>
                    <div className="col-span-3 text-right text-slate-400 text-[11px]">
                      {new Date(event.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recruiter Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Provide Constructive Feedback & Assign Mini-Project"
        description="Recommend actionable skill development tasks to qualify the candidate for reapplication."
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Demonstrated Strengths</label>
              <textarea
                rows={2}
                required
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="Highlight positive aspects observed in the assessment..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Skill Gaps to Develop (comma-separated)
              </label>
              <input
                type="text"
                required
                value={skillGaps}
                onChange={(e) => setSkillGaps(e.target.value)}
                placeholder="e.g. Node.js In-Memory Caching, State Reducer Architecture"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback Message</label>
              <textarea
                rows={3}
                required
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Explain constructively why you are recommending further practical evidence before a formal offer..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-100 space-y-3">
              <span className="text-xs font-bold text-teal-950 block">Recommended Mini-Project Assignment</span>
              <div>
                <input
                  type="text"
                  value={miniProjectTitle}
                  onChange={(e) => setMiniProjectTitle(e.target.value)}
                  placeholder="Mini-project title (e.g. Resilient LRU Cache in Node.js)"
                  className="w-full p-2 bg-white border border-teal-200 rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div>
                <textarea
                  rows={2}
                  value={miniProjectObjective}
                  onChange={(e) => setMiniProjectObjective(e.target.value)}
                  placeholder="Project objective and what practical evidence the candidate should submit..."
                  className="w-full p-2 bg-white border border-teal-200 rounded-lg text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="canReapply"
                checked={canReapply}
                onChange={(e) => setCanReapply(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <label htmlFor="canReapply" className="text-xs font-medium text-slate-700 select-none">
                Candidate is eligible to reapply upon accepted mini-project completion
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowFeedbackModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="teal" size="sm" isLoading={isSubmittingFeedback}>
                Submit Feedback
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
