import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, PlusCircle, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { Job } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VerificationBadge } from '../../components/ui/VerificationBadge';

export const ManageJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ jobs: Job[] }>('/employers/jobs');
      setJobs(res.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Opportunities
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review your active openings, monitor applicants, and inspect Trace assessment progress.
          </p>
        </div>

        <Link to="/employer/jobs/new">
          <Button variant="teal" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Post Opportunity
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading job openings...</div>
      ) : jobs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800">No opportunities published yet</h3>
            <Link to="/employer/jobs/new">
              <Button variant="teal" size="sm">Post Your First Job</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:border-slate-300 transition-all shadow-xs">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{job.title}</h3>
                      <Badge variant={job.status === 'published' ? 'success' : 'warning'} size="sm">
                        {job.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" size="sm">{job.category}</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{job.location} ({job.work_mode})</span>
                      <span>•</span>
                      <span>{job.experience_level}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {job.applicant_count || 0} Candidates
                      </span>
                    </div>

                    {job.requirements && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.requirements.map((req: any, idx: number) => (
                          <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            {req.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/employer/jobs/${job.id}/applicants`}>
                      <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Review Applicants ({job.applicant_count || 0})
                      </Button>
                    </Link>
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
