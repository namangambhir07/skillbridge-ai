import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, PlusCircle, CheckCircle, Send, Briefcase, Filter } from 'lucide-react';
import { api } from '../../lib/api';
import { StartupProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const StartupsPage: React.FC = () => {
  const { user } = useAuth();
  const [startups, setStartups] = useState<StartupProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [domainFilter, setDomainFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<StartupProfile | null>(null);

  // Form states
  const [interestMsg, setInterestMsg] = useState('');
  const [interestSkills, setInterestSkills] = useState('');
  const [interestSubmitted, setInterestSubmitted] = useState(false);

  const [newCompany, setNewCompany] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStage, setNewStage] = useState('Prototype');
  const [newCommitment, setNewCommitment] = useState('Part-time');
  const [newRoles, setNewRoles] = useState('');
  const [newSkills, setNewSkills] = useState('');

  const fetchStartups = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (domainFilter) params.append('domain', domainFilter);
      if (stageFilter) params.append('stage', stageFilter);

      const res = await api.get<{ startups: StartupProfile[] }>(`/community/startups?${params.toString()}`);
      setStartups(res.startups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, [domainFilter, stageFilter]);

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStartup) return;
    try {
      await api.post(`/community/startups/${selectedStartup.id}/express-interest`, {
        message: interestMsg,
        relevant_skills: interestSkills,
      });
      setInterestSubmitted(true);
      setTimeout(() => {
        setShowInterestModal(false);
        setInterestSubmitted(false);
        setInterestMsg('');
        setInterestSkills('');
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Failed to express interest');
    }
  };

  const handleCreateStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/community/startups', {
        company_name: newCompany,
        domain: newDomain,
        tagline: newTagline,
        description: newDesc,
        stage: newStage,
        commitment_type: newCommitment,
        roles_needed: newRoles,
        skills_needed: newSkills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setShowCreateModal(false);
      fetchStartups();
    } catch (err: any) {
      alert(err.message || 'Failed to create startup listing');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Startups & Co-Founder Discovery
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Connect with early-stage founders, explore complementary ventures, and find high-conviction co-founders.
          </p>
        </div>

        {user && (
          <Button
            variant="teal"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Post Startup Opportunity
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs">
        <span className="font-semibold text-slate-500">Filter By:</span>
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
        >
          <option value="">All Domains</option>
          <option value="Climate">Climate & CleanTech</option>
          <option value="Healthcare">Healthcare & Bio</option>
          <option value="FinTech">FinTech</option>
          <option value="AI">AI & Developer Tools</option>
        </select>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
        >
          <option value="">All Stages</option>
          <option value="Idea">Idea</option>
          <option value="Prototype">Prototype</option>
          <option value="Early Traction">Early Traction</option>
          <option value="Scaling">Scaling</option>
        </select>
      </div>

      {/* Startups Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading ventures...</div>
      ) : startups.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-2">
            <Compass className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-bold text-slate-800">No startup opportunities found</div>
            <p className="text-xs text-slate-500">Be the first to post a venture idea!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {startups.map((st) => (
            <Card key={st.id} className="hover:border-slate-300 transition-all flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{st.company_name}</h3>
                    <p className="text-xs font-semibold text-teal-700 mt-0.5">{st.tagline}</p>
                  </div>
                  <Badge variant="purple" size="sm">{st.stage}</Badge>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {st.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Roles Needed:</span>
                    <span className="font-semibold text-slate-800">{st.roles_needed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Commitment:</span>
                    <span className="font-medium text-slate-700">{st.commitment_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Domain:</span>
                    <span className="font-medium text-slate-700">{st.domain}</span>
                  </div>
                </div>

                {st.skills_needed && st.skills_needed.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {st.skills_needed.map((skill, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>

              <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Founder: {st.founder_name || 'Founder'}</span>
                <Button
                  variant="teal"
                  size="sm"
                  onClick={() => {
                    setSelectedStartup(st);
                    setShowInterestModal(true);
                  }}
                >
                  Express Interest
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Express Interest Modal */}
      <Modal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        title={`Express Interest: ${selectedStartup?.company_name}`}
        description="Share your complementary skills and why you would be a great co-founder."
      >
        {interestSubmitted ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900">Interest Sent!</h4>
            <p className="text-xs text-slate-500">The founder has been notified and can review your profile.</p>
          </div>
        ) : (
          <form onSubmit={handleInterestSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Relevant Skills & Background</label>
              <input
                type="text"
                required
                value={interestSkills}
                onChange={(e) => setInterestSkills(e.target.value)}
                placeholder="e.g. React, Node.js, distributed databases, product management"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Introductory Message to Founder</label>
              <textarea
                rows={3}
                required
                value={interestMsg}
                onChange={(e) => setInterestMsg(e.target.value)}
                placeholder="Explain what excites you about this vision and your availability..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowInterestModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="teal" size="sm">
                Send Request
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Create Startup Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Post Startup Opportunity"
        description="Connect with potential co-founders who complement your skillset."
      >
        <form onSubmit={handleCreateStartup} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Venture Name</label>
            <input
              type="text"
              required
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              placeholder="e.g. Nexus AI"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Domain</label>
              <input
                type="text"
                required
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="e.g. Healthcare, FinTech, AI"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stage</label>
              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              >
                <option value="Idea">Idea</option>
                <option value="Prototype">Prototype</option>
                <option value="Early Traction">Early Traction</option>
                <option value="Scaling">Scaling</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">One-Line Tagline</label>
            <input
              type="text"
              required
              value={newTagline}
              onChange={(e) => setNewTagline(e.target.value)}
              placeholder="e.g. Privacy-first clinical trial matching"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
            <textarea
              rows={3}
              required
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe the problem, solution, and current progress..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Roles Needed</label>
              <input
                type="text"
                required
                value={newRoles}
                onChange={(e) => setNewRoles(e.target.value)}
                placeholder="e.g. Technical Co-Founder"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Commitment</label>
              <select
                value={newCommitment}
                onChange={(e) => setNewCommitment(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              >
                <option value="Flexible">Flexible</option>
                <option value="Part-time">Part-time</option>
                <option value="Full-time">Full-time</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Complementary Skills Needed (comma-separated)</label>
            <input
              type="text"
              value={newSkills}
              onChange={(e) => setNewSkills(e.target.value)}
              placeholder="e.g. React, Python, Cloud Infrastructure"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm">
              Publish Venture
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
