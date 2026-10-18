import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Send,
  Save,
  RotateCcw,
  HelpCircle,
  FileCode2,
  ArrowRight
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';

export const AssessmentEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // assessmentId
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Consent Modal
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);

  // Editor states
  const [initialContent, setInitialContent] = useState('');
  const [revisedContent, setRevisedContent] = useState('');
  const [explanation, setExplanation] = useState('');
  const [stage, setStage] = useState<'initial' | 'follow_up' | 'completed'>('initial');
  const [saveStatus, setSaveStatus] = useState('Autosave ready');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Telemetry trackers
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pasteCount, setPasteCount] = useState(0);
  const [editCount, setEditCount] = useState(0);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    setIsLoading(true);
    api.post<any>(`/assessments/${id}/sessions`, {})
      .then((res) => {
        setAssessment(res.assessment);
        setSession(res.session);

        if (res.session.consent_accepted_at) {
          setConsentGranted(true);
        } else {
          setShowConsentModal(true);
        }

        if (res.session.status === 'follow_up_active') {
          setStage('follow_up');
        } else if (res.session.status === 'completed') {
          setStage('completed');
        }

        if (res.submissions) {
          const init = res.submissions.find((s: any) => s.submission_type === 'initial');
          const rev = res.submissions.find((s: any) => s.submission_type === 'revision');
          if (init) setInitialContent(init.content);
          if (rev) {
            setRevisedContent(rev.content);
            setExplanation(rev.candidate_explanation || '');
          }
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Failed to initialize assessment');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  // Elapsed timer when consent is granted
  useEffect(() => {
    if (consentGranted && stage !== 'completed') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [consentGranted, stage]);

  const handleAcceptConsent = async () => {
    if (!session) return;
    try {
      await api.post(`/assessment-sessions/${session.id}/consent`);
      setConsentGranted(true);
      setShowConsentModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to record consent');
    }
  };

  const logTelemetry = async (eventType: string, meta: any = {}) => {
    if (!session || !consentGranted) return;
    try {
      await api.post(`/assessment-sessions/${session.id}/events`, {
        event_type: eventType,
        metadata: { ...meta, elapsedSeconds },
      });
    } catch (err) {
      console.warn('Telemetry log silent warning:', err);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    setPasteCount((p) => p + 1);
    const pastedText = e.clipboardData.getData('text') || '';
    // Log safe metadata (length only, not clipboard content)
    logTelemetry('paste_event', { pasteLength: pastedText.length, source: 'editor_paste' });
    setSaveStatus('Paste noted • Saved');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>, isInitial: boolean) => {
    setEditCount((c) => c + 1);
    if (isInitial) {
      setInitialContent(e.target.value);
    } else {
      setRevisedContent(e.target.value);
    }
    setSaveStatus('Changes saved');

    // Debounced edit count log
    if (editCount % 5 === 0) {
      logTelemetry('editor_change', { changeLength: e.target.value.length });
    }
  };

  const handleInitialSubmit = async () => {
    if (!initialContent.trim()) {
      setErrorMsg('Please enter your response before submitting.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await api.post<any>(`/assessment-sessions/${session.id}/initial-submission`, {
        content: initialContent,
        elapsedSeconds,
      });
      setStage('follow_up');
      setRevisedContent(initialContent); // Pre-fill revision with initial content for convenient modification
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit initial task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevisionSubmit = async () => {
    if (!revisedContent.trim() || !explanation.trim()) {
      setErrorMsg('Both your revised solution and an explanation of your changes are required.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await api.post<any>(`/assessment-sessions/${session.id}/revision-submission`, {
        content: revisedContent,
        candidate_explanation: explanation,
        elapsedSeconds,
      });
      setStage('completed');
      navigate(`/trace/report/${session.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit revision');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Initializing Trace assessment environment...</div>;
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
              Trace Assessment
            </span>
            <Badge variant="outline" size="sm">{assessment?.task_type.toUpperCase()}</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {assessment?.title}
          </h1>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
            <Save className="w-3.5 h-3.5 text-emerald-600" />
            <span>{saveStatus}</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="error">
          {errorMsg}
        </Alert>
      )}

      {/* Stage Progression Indicator */}
      <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
        <div
          className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
            stage === 'initial'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <span>Stage 1: Primary Task</span>
          {stage !== 'initial' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
        </div>

        <div
          className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
            stage === 'follow_up'
              ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
              : stage === 'completed'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}
        >
          <span>Stage 2: Dynamic Constraint Shift</span>
          {stage === 'completed' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
        </div>
      </div>

      {/* STAGE 1: Primary Task Editor */}
      {stage === 'initial' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-slate-50/70 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">Task Scenario & Instructions</CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs text-slate-700 leading-relaxed space-y-2">
              <p className="whitespace-pre-line font-medium text-slate-800 text-sm">
                {assessment?.initial_prompt}
              </p>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                <strong>Evaluation Criteria:</strong> {assessment?.evaluation_criteria}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">Your Response</CardTitle>
              <span className="text-[11px] text-slate-400">{initialContent.length} characters</span>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <textarea
                rows={12}
                disabled={!consentGranted}
                value={initialContent}
                onChange={(e) => handleChange(e, true)}
                onPaste={handlePaste}
                placeholder="Compose your solution here. Draft clean, structured, professional output..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white leading-relaxed resize-y"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Autosaves automatically. Submitting unlocks the dynamic adaptation stage.
                </span>
                <Button
                  variant="teal"
                  size="md"
                  onClick={handleInitialSubmit}
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Submit Initial Solution
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STAGE 2: Dynamic Constraint Shift Follow-Up */}
      {stage === 'follow_up' && (
        <div className="space-y-6">
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader className="bg-amber-100/50 border-b border-amber-200/60">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Dynamic Requirement Change (Adaptation Scenario)
              </div>
            </CardHeader>
            <CardContent className="p-5 text-xs text-amber-950 leading-relaxed space-y-2">
              <p className="font-semibold text-sm leading-relaxed">
                {assessment?.follow_up_prompt}
              </p>
              <p className="text-[11px] text-amber-800 pt-1">
                Revise your previous draft below to incorporate the new constraint, and provide a 1-sentence rationale explaining your trade-offs.
              </p>
            </CardContent>
          </Card>

          {/* Revised Editor */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">Revised Output</CardTitle>
              <span className="text-[11px] text-slate-400">{revisedContent.length} characters</span>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <textarea
                rows={10}
                value={revisedContent}
                onChange={(e) => handleChange(e, false)}
                onPaste={handlePaste}
                placeholder="Revise your solution to account for the new constraint..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white leading-relaxed resize-y"
              />

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Candidate Rationale (Explain your main adaptation in 1-2 sentences):
                </label>
                <textarea
                  rows={2}
                  required
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="e.g. Unbundled deployment into a phased release: shipping core functionality on time, while scheduling non-critical background jobs for later."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Both your revised solution and explanation will be evaluated via our transparent adaptation rubric.
                </span>
                <Button
                  variant="teal"
                  size="md"
                  onClick={handleRevisionSubmit}
                  isLoading={isSubmitting}
                  rightIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Finalize Trace Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mandatory Telemetry Consent Modal */}
      <Modal
        isOpen={showConsentModal}
        onClose={() => {}} // Cannot close without accepting or navigating away
        title="Assessment Consent & Telemetry Notice"
        description="Please review our ethical activity observation protocol before beginning."
      >
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <p className="font-semibold text-slate-900">
              During this assessment, SkillBridge AI records limited task activity metadata, such as timestamps, paste events, edits and submissions, to generate an objective process evidence report.
            </p>
            <p className="text-[11px] text-slate-500">
              This metadata provides context to human recruiters, not proof of who or what produced the content. A paste event is never proof of cheating. No invasive screen recording or clipboard monitoring is collected.
            </p>
          </div>

          <div className="space-y-1.5 text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Timestamps and elapsed duration tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Paste occurrence counting (safe metadata without content logging)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Full human reviewer oversight for all final decisions</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => navigate('/jobs')}>
              Decline & Exit
            </Button>
            <Button variant="teal" size="sm" onClick={handleAcceptConsent}>
              I Understand & Grant Consent
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
