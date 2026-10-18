import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  ExternalLink,
  RefreshCw,
  FolderGit2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import { MiniProject } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';

export const GrowthDashboardPage: React.FC = () => {
  const [growthData, setGrowthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Submit mini-project modal
  const [selectedProject, setSelectedProject] = useState<MiniProject | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Reapply modal
  const [reapplyTarget, setReapplyTarget] = useState<any>(null);
  const [showReapplyModal, setShowReapplyModal] = useState(false);
  const [reapplyNote, setReapplyNote] = useState('');
  const [reapplySuccess, setReapplySuccess] = useState('');

  const fetchGrowth = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any>('/candidates/me/growth');
      setGrowthData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowth();
  }, []);

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setIsSubmitting(true);
    setSubmitSuccess('');
    try {
      const res = await api.post<any>(`/mini-projects/${selectedProject.id}/submit`, {
        submission_text: submissionText,
        repo_url: repoUrl,
        explanation,
      });
      setSubmitSuccess(res.message || 'Project submitted successfully for review!');
      fetchGrowth();
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmitSuccess('');
        setSubmissionText('');
        setRepoUrl('');
        setExplanation('');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReapply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reapplyTarget) return;
    try {
      const res = await api.post<any>(`/applications/${reapplyTarget.applicationId}/reapply`, {
        note: reapplyNote,
      });
      setReapplySuccess(res.message || 'Reapplication submitted successfully!');
      fetchGrowth();
      setTimeout(() => {
        setShowReapplyModal(false);
        setReapplySuccess('');
        setReapplyNote('');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to reapply');
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading growth hub...</div>;
  }

  const miniProjects = growthData?.miniProjects || [];
  const feedbacks = growthData?.feedbacks || [];
  const verifiedEvidence = growthData?.verifiedEvidence || [];
  const reapplyEligible = growthData?.reapplyEligible || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl space-y-3">
          <Badge variant="teal">Continuous Reapplication Engine</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Candidate Growth & Practical Evidence Hub
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            The heart of SkillBridge AI: Turn constructive recruiter feedback into demonstrable code projects, earn verified skill badges, and qualify for evidence-based reapplication.
          </p>
        </div>
      </div>

      {/* 1. Opportunities Ready for Reapplication Banner */}
      {reapplyEligible.length > 0 && (
        <Card className="border-emerald-300 bg-emerald-50/40 shadow-xs">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-emerald-950">
                You Are Eligible to Reapply with Verified Evidence!
              </h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              You have completed practical mini-projects addressing identified skill gaps. You can now re-submit your candidacy with verified proof directly to the employer.
            </p>

            <div className="divide-y divide-emerald-200/60 bg-white rounded-xl border border-emerald-200 p-3">
              {reapplyEligible.map((item: any, idx: number) => (
                <div key={idx} className="py-2.5 flex items-center justify-between first:pt-1 last:pb-1">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{item.jobTitle}</div>
                    <div className="text-[11px] text-slate-500">{item.orgName}</div>
                  </div>
                  <Button
                    variant="teal"
                    size="sm"
                    onClick={() => {
                      setReapplyTarget(item);
                      setShowReapplyModal(true);
                    }}
                    rightIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Reapply Now
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Assigned Mini-Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Assigned Mini-Projects
            </h2>
            <p className="text-xs text-slate-500">
              Hands-on practical challenges assigned by employers to evaluate specific capabilities.
            </p>
          </div>
        </div>

        {miniProjects.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent className="text-xs text-slate-400">
              No mini-projects currently assigned. Complete Trace assessments to receive personalized growth tasks.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {miniProjects.map((mp: MiniProject) => (
              <Card key={mp.id} className="border-slate-200 shadow-xs hover:border-slate-300 transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">{mp.title}</h3>
                        <Badge
                          variant={
                            mp.status === 'accepted'
                              ? 'success'
                              : mp.status === 'submitted'
                              ? 'info'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {mp.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Target Skill: <strong className="text-slate-800">{mp.skill_name}</strong> • Employer:{' '}
                        <strong>{mp.org_name || 'Hiring Team'}</strong>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {mp.status === 'accepted' ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          Evidence Verified
                        </div>
                      ) : (
                        <Button
                          variant="teal"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(mp);
                            setShowSubmitModal(true);
                          }}
                        >
                          {mp.status === 'submitted' ? 'Update Submission' : 'Submit Project Code'}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-2">
                    <div>
                      <strong className="text-slate-900 block mb-0.5">Objective:</strong>
                      {mp.objective}
                    </div>
                    {mp.requirements && (
                      <div>
                        <strong className="text-slate-900 block mb-0.5">Requirements:</strong>
                        <div className="whitespace-pre-line text-slate-600">{mp.requirements}</div>
                      </div>
                    )}
                    {mp.acceptance_criteria && (
                      <div className="pt-1 text-[11px] text-teal-800 bg-teal-50/60 p-2 rounded border border-teal-100">
                        <strong>Acceptance Criteria:</strong> {mp.acceptance_criteria}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 3. Recruiter Feedback History */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Recruiter Feedback History
          </h2>
          <p className="text-xs text-slate-500">
            Constructive observations from hiring managers explaining exactly what skills to develop.
          </p>
        </div>

        {feedbacks.length === 0 ? (
          <Card className="text-center py-6">
            <CardContent className="text-xs text-slate-400">
              No feedback records yet. Applications will populate here after employer review.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((fb: any) => {
              let gaps: string[] = [];
              let resources: string[] = [];
              try { gaps = JSON.parse(fb.skill_gaps); } catch { gaps = [fb.skill_gaps]; }
              try { resources = JSON.parse(fb.learning_resources); } catch { resources = []; }

              return (
                <Card key={fb.id}>
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900">
                        Feedback for "{fb.job_title}"
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-950">
                        <strong className="block font-bold mb-1">Demonstrated Strengths:</strong>
                        {fb.strengths}
                      </div>
                      <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-amber-950">
                        <strong className="block font-bold mb-1">Growth Gaps Identified:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {gaps.map((g, idx) => (
                            <Badge key={idx} variant="warning" size="sm">{g}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <strong className="text-slate-900 block mb-0.5">Hiring Manager Message:</strong>
                      {fb.feedback_message}
                    </div>

                    {resources.length > 0 && (
                      <div className="text-xs pt-1">
                        <span className="font-semibold text-slate-700">Recommended Learning: </span>
                        {resources.map((r, idx) => (
                          <a
                            key={idx}
                            href={r}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline mr-3 inline-flex items-center gap-1"
                          >
                            Resource {idx + 1} <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Verified Profile Evidence Showcase */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Verified Skill Evidence Gallery
          </h2>
          <p className="text-xs text-slate-500">
            Tangible proof accepted by employers, linked directly to your candidate profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {verifiedEvidence.map((ev: any) => (
            <Card key={ev.id} className="border-teal-100 bg-white">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{ev.title}</span>
                  <Badge variant="teal" size="sm">
                    {ev.skill_name}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>
                {ev.evidence_url && (
                  <a
                    href={ev.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 pt-1 font-medium"
                  >
                    <FolderGit2 className="w-3.5 h-3.5" />
                    View Implementation Repository
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Submit Mini-Project Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title={`Submit Practical Project: ${selectedProject?.title}`}
        description="Provide your repository link and a brief explanation of how you fulfilled the requirements."
      >
        {submitSuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900">Submission Received!</h4>
            <p className="text-xs text-slate-500">{submitSuccess}</p>
          </div>
        ) : (
          <form onSubmit={handleProjectSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Repository / Live Demo URL (e.g. GitHub or StackBlitz)
              </label>
              <input
                type="url"
                required
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/project-repo"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Implementation Details & Architecture
              </label>
              <textarea
                rows={3}
                required
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Describe your design choices, data structures, and edge-case handling..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Explanation of How This Solves the Skill Gap
              </label>
              <textarea
                rows={2}
                required
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain what you learned and how this satisfies the employer's criteria..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="teal" size="sm" isLoading={isSubmitting}>
                Submit for Verification
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Reapply Modal */}
      <Modal
        isOpen={showReapplyModal}
        onClose={() => setShowReapplyModal(false)}
        title={`Reapply to: ${reapplyTarget?.jobTitle}`}
        description="Submit updated candidacy with newly verified project evidence."
      >
        {reapplySuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900">Reapplication Sent!</h4>
            <p className="text-xs text-slate-500">{reapplySuccess}</p>
          </div>
        ) : (
          <form onSubmit={handleReapply} className="space-y-4">
            <Alert variant="info">
              Your profile now contains verified project evidence for {reapplyTarget?.jobTitle}. The recruiter will see your progress and completed mini-project.
            </Alert>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Note to Hiring Manager</label>
              <textarea
                rows={3}
                required
                value={reapplyNote}
                onChange={(e) => setReapplyNote(e.target.value)}
                placeholder="I have completed the recommended mini-project demonstrating caching and state management. Ready for next steps!"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowReapplyModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="teal" size="sm">
                Submit Reapplication
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
