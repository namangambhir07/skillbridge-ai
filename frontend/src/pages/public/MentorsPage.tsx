import React, { useState, useEffect } from 'react';
import { Users, Sparkles, Award, Clock, CheckCircle, Send, Calendar } from 'lucide-react';
import { api } from '../../lib/api';
import { Mentor } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const MentorsPage: React.FC = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [message, setMessage] = useState('');
  const [goals, setGoals] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    api.get<{ mentors: Mentor[] }>('/community/mentors')
      .then((res) => {
        setMentors(res.mentors || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;
    try {
      await api.post(`/community/mentors/${selectedMentor.id}/request`, {
        message,
        goals,
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setIsSubmitted(false);
        setMessage('');
        setGoals('');
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Failed to submit mentorship request');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find an Experienced Mentor
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Bridge skill gaps faster through personalized guidance, portfolio feedback, and project reviews from senior practitioners.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading mentors...</div>
      ) : mentors.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-bold text-slate-800">No mentors available yet</div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mentors.map((m) => (
            <Card key={m.id} className="hover:border-slate-300 transition-all flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                    {m.name ? m.name.charAt(0) : 'M'}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{m.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{m.headline}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="purple" size="sm">
                        <Award className="w-3 h-3 text-purple-600" />
                        {m.experience_years}+ Years Experience
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong className="text-slate-900 block mb-0.5">Focus Areas:</strong>
                  {m.expertise}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {m.bio}
                </p>

                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700">{m.availability}</span>
                  </div>
                </div>

                {m.skills && m.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.skills.map((s, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>

              <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">1-on-1 Guidance</span>
                <Button
                  variant="teal"
                  size="sm"
                  onClick={() => {
                    setSelectedMentor(m);
                    setShowRequestModal(true);
                  }}
                >
                  Request Mentorship
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Mentorship Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title={`Request Mentorship: ${selectedMentor?.name}`}
        description="Share your learning objectives and what projects you are actively developing."
      >
        {isSubmitted ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900">Request Sent!</h4>
            <p className="text-xs text-slate-500">The mentor has been notified and can review your profile.</p>
          </div>
        ) : (
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Growth Goals</label>
              <input
                type="text"
                required
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g. Code reviews for React mini-projects, system design interview prep"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Message to Mentor</label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself, mention where you are stuck, and what guidance you are seeking..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowRequestModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="teal" size="sm">
                Submit Mentorship Request
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
