import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Briefcase,
  Users,
  Award,
  Bell,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  Building2,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { api } from '../../lib/api';
import { AppNotification } from '../../types';

export const Navbar: React.FC = () => {
  const { user, logout, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      api.get<{ notifications: AppNotification[]; unreadCount: number }>('/notifications')
        .then((res) => {
          setNotifications(res.notifications || []);
          setUnreadCount(res.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { label: 'Explore Jobs', path: '/jobs', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Startups & Co-Founders', path: '/community/startups', icon: <Compass className="w-4 h-4" /> },
    { label: 'Mentors', path: '/community/mentors', icon: <Users className="w-4 h-4" /> },
    { label: 'How It Works', path: '/how-it-works', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-teal-600 flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">
                    SkillBridge<span className="text-teal-600">.AI</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                    Trace Engine
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 hidden md:block">Better Matches. Faster Hiring. Real Opportunities.</p>
              </div>
            </Link>

            {/* Public Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors"
                title="1-Click Demo Role Switcher"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden sm:inline">Demo Switch:</span>
                <span className="capitalize font-bold">{user ? user.role : 'Select Role'}</span>
                <ChevronDown className="w-3 h-3 text-teal-600 ml-0.5" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Demo Persona
                  </div>
                  <button
                    onClick={() => { quickDemoLogin('candidate'); setShowDemoMenu(false); navigate('/candidate/dashboard'); }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-semibold text-slate-900">Candidate (Alex Rivera)</div>
                      <div className="text-[11px] text-slate-500">Trace assessment & growth loop</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { quickDemoLogin('employer'); setShowDemoMenu(false); navigate('/employer/dashboard'); }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    <Building2 className="w-4 h-4 text-teal-600" />
                    <div>
                      <div className="font-semibold text-slate-900">Employer (Nexus Cloud)</div>
                      <div className="text-[11px] text-slate-500">Verified recruiter pipeline</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { quickDemoLogin('mentor'); setShowDemoMenu(false); navigate('/community/mentors'); }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    <Users className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-semibold text-slate-900">Mentor (Marcus Chen)</div>
                      <div className="text-[11px] text-slate-500">Career & project guidance</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { quickDemoLogin('admin'); setShowDemoMenu(false); navigate('/admin/dashboard'); }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    <Shield className="w-4 h-4 text-rose-600" />
                    <div>
                      <div className="font-semibold text-slate-900">Moderator (Sarah Jenkins)</div>
                      <div className="text-[11px] text-slate-500">Verification & job safety</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-teal-500 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-3 z-50">
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                        <span className="font-semibold text-sm text-slate-900">Notifications ({unreadCount})</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500">No notifications yet.</div>
                        ) : (
                          notifications.map((n) => (
                            <Link
                              key={n.id}
                              to={n.link || '#'}
                              onClick={() => setShowNotifications(false)}
                              className={`block p-3 text-left hover:bg-slate-50 transition-colors ${
                                n.is_read ? 'opacity-70' : 'bg-slate-50/50'
                              }`}
                            >
                              <div className="text-xs font-semibold text-slate-900">{n.title}</div>
                              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 hidden sm:inline max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="text-xs font-semibold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                        <Badge variant="teal" size="sm" className="mt-1">
                          {user.role.toUpperCase()}
                        </Badge>
                      </div>

                      {user.role === 'candidate' && (
                        <>
                          <Link
                            to="/candidate/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="block px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            Candidate Dashboard
                          </Link>
                          <Link
                            to="/candidate/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="block px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            My Profile & Skills
                          </Link>
                          <Link
                            to="/candidate/growth"
                            onClick={() => setShowUserMenu(false)}
                            className="block px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            Growth & Mini-Projects
                          </Link>
                        </>
                      )}

                      {user.role === 'employer' && (
                        <>
                          <Link
                            to="/employer/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="block px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            Recruiter Dashboard
                          </Link>
                          <Link
                            to="/employer/jobs/new"
                            onClick={() => setShowUserMenu(false)}
                            className="block px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            Post New Job
                          </Link>
                        </>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          Moderator Dashboard
                        </Link>
                      )}

                      <div className="border-t border-slate-100 mt-1">
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); navigate('/'); }}
                          className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="teal" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
