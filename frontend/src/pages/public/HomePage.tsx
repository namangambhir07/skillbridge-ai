import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
  FileCheck2,
  TrendingUp,
  Users,
  Compass,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Award
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

export const HomePage: React.FC = () => {
  const { quickDemoLogin } = useAuth();

  return (
    <div className="space-y-20 pb-12">
      {/* 1. Hero Section */}
      <section className="text-center pt-8 pb-12 max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          HackShift Hackathon • Problem Statement 2: Employment & Entrepreneurship
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Find the Right Opportunity.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-teal-600 to-teal-500">
            Prove Your Skills.
          </span>{' '}
          Keep Growing.
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          SkillBridge AI connects candidates with trusted employers through skill-based matching, practical assessments and a clear path to improvement.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link to="/jobs">
            <Button variant="teal" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Opportunities
            </Button>
          </Link>
          <Link to="/register?role=employer">
            <Button variant="outline" size="lg">
              Hire Better Talent
            </Button>
          </Link>
        </div>

        {/* 1-Click Interactive Demo Persona Switcher Banner */}
        <div className="mt-8 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm max-w-2xl mx-auto text-left">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Instant Hackathon Demo Accounts (1-Click Login)
            </span>
            <span className="text-[11px] text-slate-400">Pre-seeded with active workflows</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => quickDemoLogin('candidate')}
              className="p-2.5 rounded-lg border border-blue-100 bg-blue-50/60 hover:bg-blue-100/80 text-left transition-colors"
            >
              <div className="text-xs font-bold text-blue-900">Candidate</div>
              <div className="text-[10px] text-blue-700 truncate">Alex (Trace & Reapply)</div>
            </button>
            <button
              onClick={() => quickDemoLogin('employer')}
              className="p-2.5 rounded-lg border border-teal-100 bg-teal-50/60 hover:bg-teal-100/80 text-left transition-colors"
            >
              <div className="text-xs font-bold text-teal-900">Employer</div>
              <div className="text-[10px] text-teal-700 truncate">Elena (Nexus Cloud)</div>
            </button>
            <button
              onClick={() => quickDemoLogin('mentor')}
              className="p-2.5 rounded-lg border border-purple-100 bg-purple-50/60 hover:bg-purple-100/80 text-left transition-colors"
            >
              <div className="text-xs font-bold text-purple-900">Mentor</div>
              <div className="text-[10px] text-purple-700 truncate">Marcus (Architecture)</div>
            </button>
            <button
              onClick={() => quickDemoLogin('admin')}
              className="p-2.5 rounded-lg border border-rose-100 bg-rose-50/60 hover:bg-rose-100/80 text-left transition-colors"
            >
              <div className="text-xs font-bold text-rose-900">Admin</div>
              <div className="text-[10px] text-rose-700 truncate">Sarah (Safety Reports)</div>
            </button>
          </div>
        </div>
      </section>

      {/* 2. The Differentiator: Continuous Feedback-to-Reapplication Loop */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
          <Badge variant="teal">The Core Differentiator</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Apply → Assess → Review Evidence → Identify Skill Gaps → Receive Feedback → Complete a Mini-Project → Update Profile → Reapply
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Traditional hiring ends with generic rejection emails. SkillBridge AI closes the loop by turning every application into actionable skill growth and proof of competence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="font-semibold text-white text-sm">Explainable Matching</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent 4-tier weighting calculates skill alignment without opaque AI black-boxes.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="font-semibold text-white text-sm">Trace Practical Task</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Candidate solves scenario with consensual telemetry and dynamic constraint shift.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="font-semibold text-white text-sm">Targeted Mini-Project</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recruiter identifies gaps and recommends a hands-on project with clear acceptance criteria.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h4 className="font-semibold text-white text-sm">Evidence-Based Reapply</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Candidate submits verified project code, updates profile, and reapplies with priority.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Four Core Platform Pillars */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Built on Four Uncompromising Pillars</h2>
          <p className="text-slate-500 text-sm">Designed for verifiable competence, trust, and career acceleration.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="space-y-3 pt-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Verified Trust & Safety</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Authentic employer status verification backed by documentation. Rule-based safety scans block upfront fee scams and discriminatory listings.
              </p>
              <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                Real status badges • Anti-scam filters
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="space-y-3 pt-6">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">One-to-Many Discovery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                One verified profile unlocks multiple matching jobs, internships, co-founder startup ventures, and experienced industry mentors.
              </p>
              <div className="text-[11px] font-semibold text-teal-600 flex items-center gap-1">
                Jobs • Startups • Mentorship
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="space-y-3 pt-6">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Trace Assessment Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Practical assessment with dynamic follow-ups. Generates process evidence reports with consensual telemetry without false accusations.
              </p>
              <div className="text-[11px] font-semibold text-purple-600 flex items-center gap-1">
                Observations • Adaptation rubric
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="space-y-3 pt-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Evidence-Based Reapply</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete recommended mini-projects, earn verified skill badges, update match scores, and reapply with tangible proof of improvement.
              </p>
              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                Proof over pedigree • Never dead-end
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Trace in Detail Section */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-5">
          <Badge variant="teal">Trace Subsystem</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Trace: Objective Assessment Evidence, Not Surveillance
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Trace tests real adaptation to changed requirements. It records limited, safe metadata—such as paste events and revision timestamps—always with explicit candidate consent.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-slate-900">Observations, Not Accusations:</strong>
                <span className="text-xs text-slate-600 ml-1">A paste event or AI usage is never marked as automatic misconduct or cheating.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-slate-900">Dynamic Constraint Adaptation:</strong>
                <span className="text-xs text-slate-600 ml-1">Tests how candidates respond when requirements suddenly change mid-flight.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-slate-900">Comprehensive Evidence Report:</strong>
                <span className="text-xs text-slate-600 ml-1">Delivers a full timeline, submissions, and rubric evaluation for human recruiter judgment.</span>
              </div>
            </div>
          </div>
          <div className="pt-2">
            <Link to="/trace/report/ses_alex_demo_1">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View Seeded Trace Evidence Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Report Preview Card */}
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Trace Process Evidence Report
            </div>
            <Badge variant="teal" size="sm">Session: Completed</Badge>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Candidate:</span>
              <span className="font-semibold text-white">Alex Rivera</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Dynamic Shift:</span>
              <span className="font-semibold text-amber-400">Client Constraint (+50% Budget Cut)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Adaptation Score:</span>
              <span className="font-semibold text-teal-400">92 / 100 (Strong Adaptation)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Telemetry:</span>
              <span>1 paste event observed • 14 editor changes</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-800 text-[11px] text-slate-400 italic">
            "Activity metadata provides context, not proof of cheating or authorship. Use the complete report and human judgment."
          </div>
        </div>
      </section>

      {/* 5. Call to Action */}
      <section className="text-center max-w-2xl mx-auto space-y-4 pt-6">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Ready to experience recruitment that actually helps you grow?
        </h2>
        <p className="text-sm text-slate-500">
          Discover opportunities matched to your real strengths, or post your openings to discover proven talent.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/register?role=candidate">
            <Button variant="teal" size="lg">
              Create Candidate Profile
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">
              Explore Demo Accounts
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
