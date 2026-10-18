import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, UserCheck, ShieldAlert, Building2, User, Users, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';

export const LoginPage: React.FC = () => {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post<any>('/auth/login', { email, password });
      login(res.token, res.user, res.profile);
      if (res.user.role === 'employer') navigate('/employer/dashboard');
      else if (res.user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/candidate/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async (role: 'candidate' | 'employer' | 'mentor' | 'admin') => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await quickDemoLogin(role);
      if (role === 'employer') navigate('/employer/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'mentor') navigate('/community/mentors');
      else navigate('/candidate/dashboard');
    } catch (err: any) {
      setErrorMsg('Demo login failed. Make sure the backend server is running and seeded.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-900 to-teal-600 flex items-center justify-center text-white mx-auto shadow-md">
          <Sparkles className="w-6 h-6 text-teal-300" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to SkillBridge AI</h1>
        <p className="text-xs text-slate-500">Access your role-specific dashboard and verification workflows.</p>
      </div>

      {/* 1-Click Interactive Demo Selector Card */}
      <Card className="border-teal-200 bg-teal-50/30">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-teal-100">
            <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              1-Click Demo Accounts
            </span>
            <span className="text-[10px] text-teal-700 font-medium">Instant Login</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-left">
            <button
              type="button"
              onClick={() => handleDemoClick('candidate')}
              className="p-2 rounded-lg bg-white border border-teal-200 hover:border-teal-400 hover:shadow-xs transition-all text-left"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <User className="w-3.5 h-3.5 text-blue-600" /> Candidate
              </div>
              <div className="text-[10px] text-slate-500">Alex Rivera (Growth & Reapply)</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('employer')}
              className="p-2 rounded-lg bg-white border border-teal-200 hover:border-teal-400 hover:shadow-xs transition-all text-left"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Building2 className="w-3.5 h-3.5 text-teal-600" /> Employer
              </div>
              <div className="text-[10px] text-slate-500">Elena (Nexus Cloud Systems)</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('mentor')}
              className="p-2 rounded-lg bg-white border border-teal-200 hover:border-teal-400 hover:shadow-xs transition-all text-left"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Users className="w-3.5 h-3.5 text-purple-600" /> Mentor
              </div>
              <div className="text-[10px] text-slate-500">Marcus Chen (Architecture)</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('admin')}
              className="p-2 rounded-lg bg-white border border-teal-200 hover:border-teal-400 hover:shadow-xs transition-all text-left"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Shield className="w-3.5 h-3.5 text-rose-600" /> Moderator
              </div>
              <div className="text-[10px] text-slate-500">Sarah (Verifications & Safety)</div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Main Login Form */}
      <Card>
        <CardContent className="p-6">
          {errorMsg && (
            <Alert variant="error" className="mb-4">
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="text-center mt-5 text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
              Create an account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
