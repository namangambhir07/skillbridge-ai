import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  Bookmark,
  CheckCircle,
  Building2,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { api } from '../../lib/api';
import { Job } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VerificationBadge } from '../../components/ui/VerificationBadge';

export const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [category, setCategory] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'match'>('newest');

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (type) params.append('type', type);
      if (workMode) params.append('workMode', workMode);
      if (category) params.append('category', category);
      if (verifiedOnly) params.append('verifiedOnly', 'true');
      if (sortBy) params.append('sortBy', sortBy);

      const res = await api.get<{ jobs: Job[] }>(`/jobs?${params.toString()}`);
      setJobs(res.jobs || []);
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [type, workMode, category, verifiedOnly, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const toggleSave = async (jobId: string) => {
    if (!user || user.role !== 'candidate') return;
    try {
      const res = await api.post<{ saved: boolean }>(`/jobs/${jobId}/save`);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, isSaved: res.saved } : j))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Opportunities
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover verified jobs and internships with explainable skill matching and Trace assessments.
          </p>
        </div>

        {user && user.role === 'candidate' && (
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-teal-800">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Personalized Match Scores Enabled</span>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by role title, skill (e.g. React), company, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Search
          </Button>
        </form>

        {/* Filter Badges & Selectors */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters:
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Opportunity Types</option>
            <option value="job">Jobs</option>
            <option value="internship">Internships</option>
          </select>

          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Work Modes</option>
            <option value="remote">Remote Only</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Financial Technology">Financial Technology</option>
            <option value="Data Analytics">Data Analytics</option>
            <option value="Customer Support">Customer Support</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 select-none px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
            />
            <span>Verified Employers Only</span>
          </label>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
            >
              <option value="newest">Newest First</option>
              {user && user.role === 'candidate' && <option value="match">Highest Match Score</option>}
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Listing */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading available opportunities...</div>
      ) : jobs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No opportunities found matching your filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try clearing filters or adjusting your search keyword to view all active listings.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setType('');
                setWorkMode('');
                setCategory('');
                setVerifiedOnly(false);
              }}
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:border-slate-300 transition-all shadow-xs">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-slate-900 hover:text-blue-600 transition-colors">
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                      </span>
                      <Badge variant={job.opportunity_type === 'internship' ? 'purple' : 'info'} size="sm">
                        {job.opportunity_type.toUpperCase()}
                      </Badge>
                      <VerificationBadge status={job.verification_status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {job.org_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location} ({job.work_mode})
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        {job.experience_level}
                      </span>
                      {job.salary_range && (
                        <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {job.salary_range}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                      {job.description}
                    </p>

                    {/* Skill Tags */}
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        <span className="text-[11px] text-slate-400">Skills:</span>
                        {job.requirements.map((req, idx) => (
                          <span
                            key={idx}
                            className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                              req.is_required
                                ? 'bg-slate-100 text-slate-800 border border-slate-200'
                                : 'bg-slate-50 text-slate-600 border border-slate-100 italic'
                            }`}
                          >
                            {req.name} {req.is_required ? '' : '(preferred)'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Match Score & Action Buttons */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {/* Explainable Match Badge */}
                    {job.match && (
                      <div
                        className="text-right p-2.5 rounded-xl bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200/80"
                        title={job.match.explanation}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-lg font-extrabold text-teal-800 leading-none">
                            {job.match.overallScore}%
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Match</span>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-600 mt-1">
                          {job.match.recommendationLevel}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {user && user.role === 'candidate' && (
                        <button
                          onClick={() => toggleSave(job.id)}
                          className={`p-2 rounded-lg border transition-colors ${
                            job.isSaved
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : 'bg-white text-slate-400 hover:text-slate-700 border-slate-200'
                          }`}
                          title={job.isSaved ? 'Saved opportunity' : 'Save opportunity'}
                        >
                          <Bookmark className={`w-4 h-4 ${job.isSaved ? 'fill-current' : ''}`} />
                        </button>
                      )}

                      <Link to={`/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
