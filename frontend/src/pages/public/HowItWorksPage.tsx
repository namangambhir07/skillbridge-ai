import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Target,
  FileCheck2,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Award,
  CheckCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Employer Verification & Anti-Scam Protection',
      desc: 'Companies undergo verifiable entity reviews with authentic corporate domains and registration numbers. All job postings are continuously scanned by our rule-based safety engine to block upfront fee scams and discriminatory requirements.',
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      color: 'blue',
    },
    {
      num: '02',
      title: 'Explainable, Skill-Based Matching',
      desc: 'SkillBridge AI evaluates candidate skills against job requirements using a transparent, deterministic algorithm: 45% required skill coverage, 20% preferred skills, 20% practical experience, and 15% verified assessment proof. No black boxes.',
      icon: <Target className="w-6 h-6 text-teal-600" />,
      color: 'teal',
    },
    {
      num: '03',
      title: 'Trace: Practical Task & Dynamic Follow-Up',
      desc: 'Candidates solve practical role scenarios with explicit consent before telemetry starts. Once the initial draft is submitted, Trace introduces a dynamic constraint change (e.g. 50% budget cut or updated requirement), testing real-world adaptability.',
      icon: <FileCheck2 className="w-6 h-6 text-purple-600" />,
      color: 'purple',
    },
    {
      num: '04',
      title: 'Objective Evidence Reports (Not Surveillance)',
      desc: 'Recruiters review a complete process evidence report: candidate rationale, initial vs. revised diff, adaptation rubric scoring, and objective activity observations (paste count, editor changes). A paste event is never labeled as cheating.',
      icon: <Award className="w-6 h-6 text-indigo-600" />,
      color: 'indigo',
    },
    {
      num: '05',
      title: 'Constructive Feedback & Actionable Mini-Projects',
      desc: 'Instead of dead-end rejection emails, recruiters highlight demonstrated strengths and specify concrete skill gaps. The platform recommends targeted mini-projects with defined acceptance criteria.',
      icon: <TrendingUp className="w-6 h-6 text-amber-600" />,
      color: 'amber',
    },
    {
      num: '06',
      title: 'Profile Evidence Upgrade & Priority Reapplication',
      desc: 'Once the candidate submits the mini-project and the reviewer accepts it, the verified evidence is stamped onto their profile. Match scores automatically recalculate, and the candidate can reapply with tangible proof of improvement.',
      icon: <RefreshCw className="w-6 h-6 text-emerald-600" />,
      color: 'emerald',
    },
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="teal">Platform Architecture & Philosophy</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How SkillBridge AI Reinvents Recruitment
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The continuous feedback loop that turns every application into verified evidence, transparent evaluation, and structured career growth.
        </p>
      </div>

      {/* Six Step Progression */}
      <div className="space-y-6">
        {steps.map((st) => (
          <Card key={st.num} className="border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                {st.icon}
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{st.num}</span>
                  <h3 className="text-lg font-bold text-slate-900">{st.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Core Principles Section */}
      <Card className="bg-slate-900 text-slate-300 border-slate-800 p-8 rounded-3xl">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            Core Ethical Principles
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong>AI Assists, Never Decides Autonomously:</strong> Final hiring remains a human recruiter judgment.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong>Observations, Not Accusations:</strong> Telemetry records contextual events; pasting is not proof of misconduct.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong>No Arbitrary AI Scores:</strong> We reject fake "human probability" meters; we evaluate concrete adaptation to constraints.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong>Explicit Consent Always:</strong> Candidates must review and accept privacy notices before any telemetry logs.</span>
            </li>
          </ul>
        </div>
      </Card>

      <div className="text-center pt-4">
        <Link to="/jobs">
          <Button variant="teal" size="lg">
            Explore Active Opportunities
          </Button>
        </Link>
      </div>
    </div>
  );
};
