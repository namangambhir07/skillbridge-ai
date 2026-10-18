import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, User, Building2, Users, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get('role') === 'employer' ? 'employer' : 'candidate';
  const [role, setRole] = useState<'candidate' | 'employer' | 'mentor'>(initialRole as any);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [headline, setHeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post<any>('/auth/register', {
        name,
        email,
        password,
        role,
        orgName: role === 'employer' ? orgName : undefined,
        headline: role !== 'employer' ? headline : undefined,
      });

      login(res.token, res.user);
      if (role === 'employer') navigate('/employer/dashboard');
      else if (role === 'mentor') navigate('/community/mentors');
      else navigate('/candidate/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create your SkillBridge Account</h1>
        <p className="text-xs text-slate-500">Join the evidence-based recruitment ecosystem.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          {errorMsg && (
            <Alert variant="error" className="mb-4">
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Role Selector Tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">I am joining as a:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    role === 'candidate'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs block">Candidate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    role === 'employer'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs block">Employer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('mentor')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    role === 'mentor'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs block">Mentor</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            {role === 'employer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Company Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Technologies"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>
            )}

            {role !== 'employer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder={role === 'candidate' ? 'e.g. Full-Stack Developer (React / Node)' : 'e.g. Senior Architect & Tech Lead'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>
            )}

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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password (min 6 characters)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="teal"
              size="md"
              className="w-full"
              isLoading={isLoading}
            >
              Complete Registration
            </Button>
          </form>

          <div className="text-center mt-5 text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
