import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

export const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [opportunityType, setOpportunityType] = useState<'job' | 'internship'>('job');
  const [category, setCategory] = useState('Software Engineering');
  const [workMode, setWorkMode] = useState<'remote' | 'hybrid' | 'onsite'>('remote');
  const [location, setLocation] = useState('Remote (Global)');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level (1-3 yrs)');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [deadline, setDeadline] = useState('');

  // Skill Requirements
  const [skills, setSkills] = useState<{ name: string; is_required: boolean }[]>([
    { name: 'React', is_required: true },
    { name: 'TypeScript', is_required: true },
  ]);
  const [newSkill, setNewSkill] = useState('');

  // Trace Assessment Scenario
  const [assessmentTitle, setAssessmentTitle] = useState('Practical Client Delivery Scenario');
  const [taskType, setTaskType] = useState<'writing' | 'coding' | 'data_analysis' | 'problem_solving'>('coding');
  const [initialPrompt, setInitialPrompt] = useState('Build a clean, strongly typed state reducer function in TypeScript handling pagination and error states.');
  const [followUpPrompt, setFollowUpPrompt] = useState('DYNAMIC CONSTRAINT: Latency requires adding a 30-second TTL cache to each page. Modify the reducer and write an invalidation function.');

  // Live Safety Policy Engine results
  const [safetyCheck, setSafetyCheck] = useState<any>(null);
  const [isCheckingSafety, setIsCheckingSafety] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Trigger live safety check whenever title or description changes
  useEffect(() => {
    if (!description && !title) {
      setSafetyCheck(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSafety(true);
      try {
        const res = await api.post<any>('/jobs/check-safety', { title, description });
        setSafetyCheck(res);
      } catch (err) {
        console.error('Safety check error', err);
      } finally {
        setIsCheckingSafety(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [title, description]);

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setSkills([...skills, { name: newSkill.trim(), is_required: true }]);
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (skills.length === 0) {
      setErrorMsg('Please specify at least one required skill.');
      return;
    }
    setIsPublishing(true);
    setErrorMsg('');
    try {
      const res = await api.post<any>('/employers/jobs', {
        title,
        opportunity_type: opportunityType,
        category,
        work_mode: workMode,
        location,
        experience_level: experienceLevel,
        description,
        responsibilities,
        eligibility_criteria: eligibility,
        salary_range: salaryRange,
        deadline: deadline || undefined,
        requirements: skills,
        assessment: {
          title: assessmentTitle,
          task_type: taskType,
          initial_prompt: initialPrompt,
          follow_up_prompt: followUpPrompt,
        },
      });

      navigate('/employer/jobs');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create opportunity');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Post an Opportunity
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Create verified jobs or internships with built-in Trace assessments and real-time safety policy screening.
        </p>
      </div>

      {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

      <form onSubmit={handlePublish} className="space-y-6">
        {/* Core Opportunity Details */}
        <Card>
          <CardHeader>
            <CardTitle>Core Role Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Opportunity Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Junior Full-Stack Engineer"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Opportunity Type</label>
                <select
                  value={opportunityType}
                  onChange={(e) => setOpportunityType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="job">Full-Time / Part-Time Job</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Financial Technology">Financial Technology</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Product Design">Product Design</option>
                  <option value="Customer Support">Customer Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, San Francisco, London"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
                <input
                  type="text"
                  required
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  placeholder="e.g. 0-2 years, Entry Level"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Range / Stipend</label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="e.g. $75,000 - $95,000 USD"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Description with LIVE Safety Policy Engine Screening */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">Detailed Job Description</label>
                {safetyCheck && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[11px] text-slate-400">Safety Check:</span>
                    {safetyCheck.verdict === 'ALLOW' ? (
                      <Badge variant="success" size="sm">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> ALLOW
                      </Badge>
                    ) : safetyCheck.verdict === 'REVIEW' ? (
                      <Badge variant="warning" size="sm">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> REVIEW REQUIRED
                      </Badge>
                    ) : (
                      <Badge variant="danger" size="sm">
                        <ShieldAlert className="w-3 h-3 text-rose-600" /> BLOCKED
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe role scope, team mission, and impact..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white leading-relaxed"
              />

              {/* Safety Feedback Box */}
              {safetyCheck && safetyCheck.verdict !== 'ALLOW' && (
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${
                    safetyCheck.verdict === 'BLOCK'
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    {safetyCheck.engineName}: {safetyCheck.verdict}
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {safetyCheck.reasons.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                  {safetyCheck.verdict === 'BLOCK' && (
                    <div className="text-[10px] font-bold text-rose-700 pt-1">
                      Policy rule prevents publishing until upfront fee demands or exclusionary terms are corrected.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Responsibilities (optional)</label>
                <textarea
                  rows={3}
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  placeholder="Key day-to-day deliverables..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Eligibility Criteria (optional)</label>
                <textarea
                  rows={3}
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="Degree, years, or practical portfolio requirements..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Required & Preferred Skills</CardTitle>
            <CardDescription>Directly drives our deterministic 4-tier matching engine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter required skill (e.g. React, SQL, Docker)..."
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
              <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                Add Skill
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium"
                >
                  <span>{s.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...skills];
                      updated[idx].is_required = !updated[idx].is_required;
                      setSkills(updated);
                    }}
                    className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer ${
                      s.is_required ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border'
                    }`}
                  >
                    {s.is_required ? 'Required' : 'Preferred'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSkill(idx)}
                    className="text-slate-400 hover:text-rose-600 ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attached Trace Assessment Scenario */}
        <Card className="border-teal-200/90 bg-teal-50/20">
          <CardHeader className="bg-teal-50/50 border-b border-teal-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-teal-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Configure Trace Practical Assessment
              </CardTitle>
              <Badge variant="teal" size="sm">Trace Subsystem</Badge>
            </div>
            <CardDescription className="text-teal-700">
              Evaluates real candidate problem-solving and dynamic constraint adaptability.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assessment Task Title</label>
                <input
                  type="text"
                  required
                  value={assessmentTitle}
                  onChange={(e) => setAssessmentTitle(e.target.value)}
                  className="w-full p-2 bg-white border border-teal-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Category</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as any)}
                  className="w-full p-2 bg-white border border-teal-200 rounded-lg text-xs focus:outline-none"
                >
                  <option value="coding">Coding / Algorithm Task</option>
                  <option value="writing">Technical / Stakeholder Writing</option>
                  <option value="data_analysis">Data Analysis / SQL Problem</option>
                  <option value="problem_solving">General Problem Solving</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stage 1 Initial Prompt</label>
              <textarea
                rows={3}
                required
                value={initialPrompt}
                onChange={(e) => setInitialPrompt(e.target.value)}
                placeholder="Define the primary scenario requirements..."
                className="w-full p-2.5 bg-white border border-teal-200 rounded-lg text-xs focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stage 2 Dynamic Follow-Up Prompt (The Changed Constraint)
              </label>
              <textarea
                rows={2}
                required
                value={followUpPrompt}
                onChange={(e) => setFollowUpPrompt(e.target.value)}
                placeholder="Define how scenario constraints shift mid-flight..."
                className="w-full p-2.5 bg-white border border-teal-200 rounded-lg text-xs focus:outline-none font-mono"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" size="md" onClick={() => navigate('/employer/jobs')}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="teal"
            size="md"
            isLoading={isPublishing}
            disabled={safetyCheck?.verdict === 'BLOCK'}
          >
            Publish Opportunity
          </Button>
        </div>
      </form>
    </div>
  );
};
