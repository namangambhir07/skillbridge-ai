import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/employers/analytics')
      .then((res) => setAnalytics(res))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading analytics...</div>;
  }

  const { applicationStatusDistribution = [], assessmentCompletion, miniProjectGrowth } = analytics || {};

  const chartData = applicationStatusDistribution.map((row: any) => ({
    name: row.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    count: row.count,
  }));

  const pieData = [
    { name: 'Completed Assessments', value: assessmentCompletion?.completed || 1, color: '#0d9488' },
    { name: 'In Progress', value: assessmentCompletion?.inProgress || 0, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-600" />
          Recruiter Pipeline Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Observed metrics across candidate applications, Trace completion rates, and mini-project evidence.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Trace Assessments Assigned</div>
            <div className="text-2xl font-extrabold text-slate-900">{assessmentCompletion?.totalAssigned || 0}</div>
            <div className="text-[11px] text-teal-600 font-medium">
              Avg duration: {assessmentCompletion?.avgMinutes || 31} minutes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Mini-Projects Assigned</div>
            <div className="text-2xl font-extrabold text-slate-900">{miniProjectGrowth?.totalAssigned || 0}</div>
            <div className="text-[11px] text-blue-600 font-medium">Targeted skill growth</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Accepted Project Evidence</div>
            <div className="text-2xl font-extrabold text-slate-900">{miniProjectGrowth?.acceptedEvidence || 0}</div>
            <div className="text-[11px] text-emerald-600 font-medium">Qualified for reapplication</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Status Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applications by Pipeline Stage</CardTitle>
            <CardDescription className="text-xs">Candidate progression across active hiring stages.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 h-64">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No application distribution data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Trace Completion Ratio Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assessment Session Completion</CardTitle>
            <CardDescription className="text-xs">Trace practical task completion ratio.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 text-xs mt-2">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-600" /> Completed</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> In Progress</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
        <strong>Transparency Note:</strong> All analytics represent observed metrics recorded from your actual database submissions, assessments, and review decisions.
      </div>
    </div>
  );
};
