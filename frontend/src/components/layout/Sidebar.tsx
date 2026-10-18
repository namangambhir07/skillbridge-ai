import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  TrendingUp,
  User,
  PlusCircle,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Compass,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const candidateLinks = [
    { label: 'Dashboard', path: '/candidate/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Recommended Matches', path: '/candidate/matches', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Applications Tracker', path: '/candidate/applications', icon: <FileText className="w-4 h-4" /> },
    { label: 'Growth & Mini-Projects', path: '/candidate/growth', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Profile & Evidence', path: '/candidate/profile', icon: <User className="w-4 h-4" /> },
    { label: 'Co-Founders & Startups', path: '/community/startups', icon: <Compass className="w-4 h-4" /> },
    { label: 'Mentors Directory', path: '/community/mentors', icon: <Users className="w-4 h-4" /> },
  ];

  const employerLinks = [
    { label: 'Recruiter Dashboard', path: '/employer/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Post Opportunity', path: '/employer/jobs/new', icon: <PlusCircle className="w-4 h-4" /> },
    { label: 'Manage Jobs', path: '/employer/jobs', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Recruiter Analytics', path: '/employer/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Organization Verification', path: '/employer/verification', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const adminLinks = [
    { label: 'Moderation Overview', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Employer Verifications', path: '/admin/verifications', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Job Safety Reports', path: '/admin/reports', icon: <AlertTriangle className="w-4 h-4" /> },
    { label: 'Platform Audit Logs', path: '/admin/audit-logs', icon: <FileCheck className="w-4 h-4" /> },
  ];

  const mentorLinks = [
    { label: 'Mentorship Requests', path: '/mentor/requests', icon: <Users className="w-4 h-4" /> },
    { label: 'Mentors Directory', path: '/community/mentors', icon: <Compass className="w-4 h-4" /> },
  ];

  let links = candidateLinks;
  if (user.role === 'employer') links = employerLinks;
  else if (user.role === 'admin') links = adminLinks;
  else if (user.role === 'mentor') links = mentorLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col min-h-[calc(100vh-4rem)] p-4 shrink-0">
      <div className="mb-4 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Workspace</div>
        <div className="text-sm font-semibold text-slate-900 truncate mt-0.5">{user.name}</div>
        <div className="text-xs text-slate-500 capitalize">{user.role} Account</div>
      </div>

      <nav className="space-y-1 flex-1">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Trace Engine Feature Callout */}
      <div className="mt-auto p-3.5 bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100 rounded-xl">
        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          Trace Assessment
        </div>
        <p className="text-[11px] text-slate-600 mt-1 leading-snug">
          Objective telemetry & dynamic adaptation evidence for trusted hiring.
        </p>
      </div>
    </aside>
  );
};
