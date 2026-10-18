import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  Globe,
  Plus,
  ShieldCheck,
  CheckCircle,
  Award,
  Sparkles,
  Save,
  FolderGit2
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

export const CandidateProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Editable Form Fields
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [preferredRoles, setPreferredRoles] = useState('');
  const [preferredWorkMode, setPreferredWorkMode] = useState('remote');
  const [locationPref, setLocationPref] = useState('');
  const [availability, setAvailability] = useState('');
  const [visibility, setVisibility] = useState('public');

  // New Skill input
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProf, setNewSkillProf] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any>('/candidates/me');
      setProfile(res.profile);
      setSkills(res.skills || []);
      setEvidence(res.evidence || []);

      if (res.profile) {
        setHeadline(res.profile.headline || '');
        setBio(res.profile.bio || '');
        setEducation(res.profile.education || '');
        setExperience(res.profile.experience || '');
        setPortfolioUrl(res.profile.portfolio_url || '');
        setGithubUrl(res.profile.github_url || '');
        setLinkedinUrl(res.profile.linkedin_url || '');
        setPreferredRoles(res.profile.preferred_roles || '');
        setPreferredWorkMode(res.profile.preferred_work_mode || 'remote');
        setLocationPref(res.profile.location_preference || '');
        setAvailability(res.profile.availability || '');
        setVisibility(res.profile.profile_visibility || 'public');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    try {
      await api.patch('/candidates/me', {
        headline,
        bio,
        education,
        experience,
        portfolio_url: portfolioUrl,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        preferred_roles: preferredRoles,
        preferred_work_mode: preferredWorkMode,
        location_preference: locationPref,
        availability,
        profile_visibility: visibility,
      });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      await api.patch('/candidates/me', {
        skills: [{ name: newSkillName.trim(), proficiency_level: newSkillProf, evidence_source: 'self_reported' }],
      });
      setNewSkillName('');
      fetchProfile();
    } catch (err: any) {
      alert(err.message || 'Failed to add skill');
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Candidate Profile & Verified Evidence
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain your capabilities, verified mini-project evidence, and opportunity preferences.
          </p>
        </div>
      </div>

      {successMsg && (
        <Alert variant="success">
          {successMsg}
        </Alert>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Professional Overview</CardTitle>
            <CardDescription>Core details visible to verified employers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Full-Stack Software Engineer (React / TypeScript / Node.js)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Professional Summary</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your technical background, engineering passions, and career focus..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Summary</label>
                <textarea
                  rows={2}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. Junior Web Developer at WebFlow (6 mo); Open-source contributor..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Education</label>
                <textarea
                  rows={2}
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. B.S. in Computer Science, Tech University (2024)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links & Connectors */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio & Connectors</CardTitle>
            <CardDescription>
              Integration-ready profile links. Clearly distinguishing imported metadata from self-reported data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" /> Portfolio URL
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourportfolio.dev"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-slate-400" /> GitHub URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" /> LinkedIn URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Public GitHub Repository Preview Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FolderGit2 className="w-4 h-4 text-slate-600" />
                  GitHub Integration Metadata (Public Repositories)
                </span>
                <Badge variant="outline" size="sm">Connector Active</Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                Connected handle: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">alexrivera-demo</code>. Public commits and repositories are parsed as supporting background evidence.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Opportunity Preferences & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences & Visibility Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Work Mode</label>
                <select
                  value={preferredWorkMode}
                  onChange={(e) => setPreferredWorkMode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                  <option value="any">Any Mode</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Availability</label>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Immediate, 2 weeks notice"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Profile Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="public">Public (All verified recruiters & founders)</option>
                  <option value="verified_employers_only">Verified Employers Only</option>
                  <option value="private">Private (Only active applications)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="teal" size="md" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            Save Profile Changes
          </Button>
        </div>
      </form>

      {/* Skills & Evidence Section */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Verification Evidence</CardTitle>
          <CardDescription>
            Skills marked with verified badges reflect evaluated Trace assessments or peer-reviewed mini-projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Skill Mini-Form */}
          <form onSubmit={handleAddSkill} className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="text"
              required
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Add skill (e.g. Docker, GraphQL, Python)..."
              className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
            />
            <select
              value={newSkillProf}
              onChange={(e) => setNewSkillProf(e.target.value as any)}
              className="p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Skill
            </Button>
          </form>

          {/* Current Skills List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skills.map((s) => (
              <div
                key={s.id || s.name}
                className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{s.name}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{s.proficiency_level} level</div>
                </div>

                <div>
                  {s.evidence_source === 'project_verified' ? (
                    <Badge variant="teal" size="sm" title="Verified by accepted mini-project">
                      <Award className="w-3 h-3 text-teal-600" /> Project Verified
                    </Badge>
                  ) : s.evidence_source === 'assessment_verified' ? (
                    <Badge variant="purple" size="sm" title="Verified by Trace assessment">
                      <ShieldCheck className="w-3 h-3 text-purple-600" /> Trace Verified
                    </Badge>
                  ) : (
                    <Badge variant="default" size="sm">Self-Reported</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Verified Evidence Portfolio Records */}
          {evidence && evidence.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Attached Practical Project Evidence
              </h4>
              <div className="space-y-2">
                {evidence.map((ev) => (
                  <div key={ev.id} className="p-3 bg-teal-50/40 rounded-xl border border-teal-100 flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                        {ev.title}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{ev.description}</p>
                      {ev.evidence_url && (
                        <a
                          href={ev.evidence_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 hover:underline mt-1 inline-block"
                        >
                          {ev.evidence_url}
                        </a>
                      )}
                    </div>
                    <Badge variant="teal" size="sm">Verified</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const ProfilePage = CandidateProfilePage;
