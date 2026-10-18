import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Briefcase,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  GraduationCap,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VerificationBadge } from '../../components/ui/VerificationBadge';

interface MatchItem {
  id: string;
  title: string;
  opportunity_type: 'job' | 'internship';
  category: string;
  work_mode: 'remote' | 'hybrid' | 'onsite';
  location: string;
  experience_level: string;
  salary_range?: string;
  org_name: string;
  verification_status?: any;
  requirements: { name: string; is_required: boolean | number; min_proficiency?: string }[];
  match: {
    overallScore: number;
    breakdown: {
      requiredScore: number;
      preferredScore: number;
      experienceScore: number;
      assessmentScore: number;
    };
    matchedRequiredSkills: string[];
    missingRequiredSkills: string[];
    matchedPreferredSkills: string[];
    missingPreferredSkills: string[];
    verifiedSkills: string[];
    explanation: string;
    recommendationLevel: string;
  };
  hasApplied: boolean;
  applicationStatus?: string | null;
}

export const MatchesPage: React.FC = () => {
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<{ matches: MatchItem[] }>({
    queryKey: ['candidate-matches'],
    queryFn: () => api.get('/candidates/me/matches'),
  });

  const matches = data?.matches || [];

  const filteredMatches = matches.filter((item) => {
    if (filterTier === 'strong' && item.match.overallScore < 85) return false;
    if (filterTier === 'good' && (item.match.overallScore < 70 || item.match.overallScore >= 85)) return false;
    if (filterTier === 'potential' && (item.match.overallScore < 50 || item.match.overallScore >= 70)) return false;
    if (filterTier === 'development' && item.match.overallScore >= 50) return false;

    if (filterMode !== 'all' && item.work_mode !== filterMode) return false;

    return true;
  });

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (score >= 70) return 'bg-blue-50 text-blue-700 border-blue-300';
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-300';
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-200">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Explainable Opportunity Matches</h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Deterministic 4-tier match scoring based on required skills (45%), preferred skills (20%), practical projects (20%), and Trace assessment evidence (15%).
          </p>
        </div>

        <Link to="/growth">
          <Button variant="outline" size="sm" className="gap-2">
            <GraduationCap className="w-4 h-4 text-teal-600" />
            Improve Matches with Mini-Projects
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter by:
          </div>

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-700 shadow-sm focus:border-brand-primary focus:outline-none"
          >
            <option value="all">All Match Levels</option>
            <option value="strong">Strong Match (85%+)</option>
            <option value="good">Good Match (70-84%)</option>
            <option value="potential">Potential Match (50-69%)</option>
            <option value="development">Skill Development (&lt;50%)</option>
          </select>

          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-700 shadow-sm focus:border-brand-primary focus:outline-none"
          >
            <option value="all">All Work Modes</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredMatches.length}</span> scored opportunities
        </div>
      </Card>

      {/* Matches List */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-600 font-medium">Calculating explainable match scores across active listings...</p>
        </div>
      ) : error ? (
        <Card className="p-8 text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="font-semibold">Unable to load match evaluations</p>
          <p className="text-xs text-slate-500 mt-1">Please try refreshing your session.</p>
        </Card>
      ) : filteredMatches.length === 0 ? (
        <Card className="p-12 text-center">
          <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No opportunities match the selected criteria</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Try adjusting your filters or head to the Growth Dashboard to unlock higher match scores by completing targeted mini-projects.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { setFilterTier('all'); setFilterMode('all'); }}>
              Reset Filters
            </Button>
            <Link to="/growth">
              <Button size="sm">Go to Growth Dashboard</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((item) => {
            const isExpanded = expandedMatchId === item.id;
            return (
              <Card key={item.id} className="p-5 transition-shadow hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Job Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {item.opportunity_type}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-medium text-slate-600">{item.category}</span>
                      <VerificationBadge status={item.verification_status} />
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 hover:text-brand-primary">
                      <Link to={`/jobs/${item.id}`}>{item.title}</Link>
                    </h2>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                      <span className="font-medium text-slate-800">{item.org_name}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {item.location} ({item.work_mode})
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        {item.experience_level}
                      </span>
                      {item.salary_range && (
                        <span className="font-semibold text-slate-700">{item.salary_range}</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Match Score Card */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:border-l md:border-slate-100 md:pl-5">
                    <div className={`px-4 py-2 rounded-xl border text-center ${getScoreBadgeColor(item.match.overallScore)}`}>
                      <div className="text-2xl font-black">{item.match.overallScore}%</div>
                      <div className="text-[11px] font-semibold tracking-wide uppercase">
                        {item.match.recommendationLevel}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <Link to={`/jobs/${item.id}`}>
                        <Button variant="outline" size="sm" className="w-full justify-between gap-2">
                          View Role
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      {item.hasApplied ? (
                        <Badge variant="success" className="justify-center py-1.5 text-xs font-semibold">
                          Applied ({item.applicationStatus || 'Under Review'})
                        </Badge>
                      ) : (
                        <Link to={`/jobs/${item.id}`}>
                          <Button size="sm" className="w-full">
                            Apply
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Bar */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Required (45%)</span>
                      <span className="font-bold text-slate-800">{item.match.breakdown.requiredScore}%</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Preferred (20%)</span>
                      <span className="font-bold text-slate-800">{item.match.breakdown.preferredScore}%</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Projects (20%)</span>
                      <span className="font-bold text-slate-800">{item.match.breakdown.experienceScore}%</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Trace Assessment (15%)</span>
                      <span className="font-bold text-slate-800">{item.match.breakdown.assessmentScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Explainable Insights Toggle */}
                <div className="mt-3">
                  <button
                    onClick={() => setExpandedMatchId(isExpanded ? null : item.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-secondary transition-colors"
                  >
                    <span>{isExpanded ? 'Hide' : 'View'} Explainable Match Evidence</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs animate-in fade-in duration-150">
                      <div>
                        <span className="font-bold text-slate-800 block mb-1">Scoring Rationale:</span>
                        <p className="text-slate-600 leading-relaxed">{item.match.explanation}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                        {/* Matched Required Skills */}
                        <div>
                          <span className="font-semibold text-emerald-800 flex items-center gap-1 mb-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Matched Skills ({item.match.matchedRequiredSkills.length + item.match.matchedPreferredSkills.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {[...item.match.matchedRequiredSkills, ...item.match.matchedPreferredSkills].map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 font-medium text-[11px]"
                              >
                                {s}
                              </span>
                            ))}
                            {item.match.matchedRequiredSkills.length === 0 && item.match.matchedPreferredSkills.length === 0 && (
                              <span className="text-slate-400 italic">No skills matched yet</span>
                            )}
                          </div>
                        </div>

                        {/* Missing Skills & Development Path */}
                        <div>
                          <span className="font-semibold text-amber-800 flex items-center gap-1 mb-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                            Skills to Build ({item.match.missingRequiredSkills.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.match.missingRequiredSkills.map((s, idx) => (
                              <Link key={idx} to="/growth">
                                <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 font-medium text-[11px] hover:bg-amber-200 transition-colors inline-flex items-center gap-1">
                                  {s} <span className="text-[9px] underline">Build Project</span>
                                </span>
                              </Link>
                            ))}
                            {item.match.missingRequiredSkills.length === 0 && (
                              <span className="text-emerald-700 font-medium">All required skills demonstrated!</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
