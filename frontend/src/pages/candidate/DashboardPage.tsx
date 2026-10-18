import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  Briefcase,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Bookmark,
  ShieldCheck,
  Award
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

export const CandidateDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>('/candidates/me'),
      api.get<any>('/candidates/me/matches'),
      api.get<any>('/candidates/me/applications'),
      api.get<any>('/candidates/me/growth'),
    ])
      .then(([meRes, matchRes, appRes, growthRes]) => {
        setData(meRes);
        setMatches(matchRes.matches?.slice(0, 3) || []);
        setApplications(appRes.applications || []);
        setGrowthData(growthRes);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading your dashboard metrics...</div>;
  }

  const pendingAssessment = applications.find((a) => a.status === 'assessment_required');
  const improvementApplication = applications.find((a) => a.status === 'improvement_suggested');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl space-y-3">
          <Badge variant="teal">Candidate Growth Portal</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your evidence-based recruitment cockpit. Track applications, complete dynamic Trace tasks, and build verified practical project proof.
          </p>
        </div>
      </div>

      {/* Actionable Alert Banners if Tasks are Pending */}
      {pendingAssessment && (
        <Alert variant="warning" title="Action Required: Practical Skill Assessment">
          You have an active application for "{pendingAssessment.job_title}" that requires completing a Trace practical assessment to proceed.
          <div className="mt-2">
            <Link to={`/trace/assessment/asm_nexus_fs`}>
              <Button variant="primary" size="sm">
                Launch Trace Assessment Session
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      {improvementApplication && (
        <Alert variant="info" title="Constructive Recruiter Feedback Available">
          "{improvementApplication.org_name}" reviewed your assessment for "{improvementApplication.job_title}" and assigned a mini-project so you can qualify for reapplication!
          <div className="mt-2">
            <Link to="/candidate/growth">
              <Button variant="teal" size="sm">
                Open Growth Hub & Mini-Project
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Active Applications</div>
            <div className="text-2xl font-extrabold text-slate-900">{applications.length}</div>
            <div className="text-[11px] text-teal-600 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Tracked in real-time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Verified Skills</div>
            <div className="text-2xl font-extrabold text-slate-900">
              {data?.skills?.filter((s: any) => s.evidence_source !== 'self_reported').length || 0}
            </div>
            <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Assessment & Project proof
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Assigned Mini-Projects</div>
            <div className="text-2xl font-extrabold text-slate-900">
              {growthData?.miniProjects?.length || 0}
            </div>
            <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Targeted improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Reapplication Eligible</div>
            <div className="text-2xl font-extrabold text-slate-900">
              {growthData?.reapplyEligible?.length || 0}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <Award className="w-3 h-3" /> Ready to re-submit
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Split: "Continue Your Growth" & "Top Matching Opportunities" */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Continue Your Growth (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  Continue Your Growth
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Actionable steps based on actual skill gaps or ongoing tasks.</p>
              </div>
              <Link to="/candidate/growth">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {growthData?.miniProjects && growthData.miniProjects.length > 0 ? (
                growthData.miniProjects.slice(0, 2).map((mp: any) => (
                  <div key={mp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{mp.title}</span>
                      <Badge variant={mp.status === 'accepted' ? 'success' : 'warning'} size="sm">
                        {mp.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong>Skill Targeted:</strong> {mp.skill_name} • <strong>Opportunity:</strong> {mp.job_title}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {mp.objective}
                    </p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Employer: {mp.org_name}</span>
                      <Link to="/candidate/growth">
                        <Button variant="outline" size="sm">
                          {mp.status === 'accepted' ? 'View Accepted Evidence' : 'Submit Project Code'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active mini-projects assigned yet. Complete Trace assessments to receive structured skill growth tasks.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Applications Quick Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Active Applications</CardTitle>
              <Link to="/candidate/applications">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  All Applications
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {applications.slice(0, 3).map((app) => (
                  <div key={app.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-bold text-sm text-slate-900">{app.job_title}</div>
                      <div className="text-xs text-slate-500">{app.org_name} • Applied {new Date(app.applied_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="info" size="sm" className="capitalize">
                        {app.status.replace('_', ' ')}
                      </Badge>
                      <Link to="/candidate/applications">
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Recommended Matches (1 col) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Recommended Matches
              </CardTitle>
              <Link to="/candidate/matches">
                <Button variant="ghost" size="sm">Explore</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {matches.map((job) => (
                <div key={job.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/jobs/${job.id}`} className="font-bold text-xs text-slate-900 hover:text-blue-600">
                      {job.title}
                    </Link>
                    <Badge variant="teal" size="sm">{job.match?.overallScore || 0}%</Badge>
                  </div>
                  <div className="text-[11px] text-slate-500">{job.org_name} • {job.work_mode}</div>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{job.match?.explanation}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Profile Completion Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Strength</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Completion Level</span>
                <span className="font-bold text-teal-600">85%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full w-[85%]" />
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Your profile has verified evidence in React and TypeScript. Complete Node.js project evidence to maximize senior role visibility.
              </p>
              <Link to="/candidate/profile">
                <Button variant="outline" size="sm" className="w-full mt-1">
                  Manage Profile & Skills
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const DashboardPage = CandidateDashboardPage;
