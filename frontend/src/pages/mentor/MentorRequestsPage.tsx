import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  GraduationCap,
  Sparkles,
  Mail,
  AlertCircle,
  Send,
} from 'lucide-react';
import { api } from '../../lib/api';
import { MentorshipRequest } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const MentorRequestsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted'>('all');
  const [selectedRequest, setSelectedRequest] = useState<MentorshipRequest | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'decline' | 'complete' | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data, isLoading, error } = useQuery<{ requests: MentorshipRequest[] }>({
    queryKey: ['mentor-requests'],
    queryFn: () => api.get('/community/mentors/my-requests'),
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, status, feedback }: { id: string; status: string; feedback?: string }) =>
      api.patch(`/community/mentors/requests/${id}`, { status, feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-requests'] });
      setStatusMessage({ type: 'success', text: `Mentorship request updated successfully.` });
      setSelectedRequest(null);
      setActionType(null);
      setFeedbackNotes('');
    },
    onError: (err: any) => {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update request.' });
    },
  });

  const requests = data?.requests || [];

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'pending') return r.status === 'pending';
    if (activeTab === 'accepted') return r.status === 'accepted';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="success">Active Mentorship</Badge>;
      case 'declined':
        return <Badge variant="danger">Declined</Badge>;
      case 'completed':
        return <Badge variant="info">Completed</Badge>;
      case 'pending':
      default:
        return <Badge variant="warning">Pending Review</Badge>;
    }
  };

  const handleOpenAction = (req: MentorshipRequest, action: 'accept' | 'decline' | 'complete') => {
    setSelectedRequest(req);
    setActionType(action);
    setFeedbackNotes(req.feedback || '');
  };

  const handleSubmitAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !actionType) return;

    const targetStatus = actionType === 'accept' ? 'accepted' : actionType === 'decline' ? 'declined' : 'completed';
    updateRequestMutation.mutate({
      id: selectedRequest.id,
      status: targetStatus,
      feedback: feedbackNotes,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-royal-blue/10 text-royal-blue">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Mentorship Requests</h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Review candidate guidance requests, provide structured feedback, and help emerging talent close practical skill gaps.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-xs font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'all'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'pending'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pending ({requests.filter((r) => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('accepted')}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'accepted'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Mentorships ({requests.filter((r) => r.status === 'accepted').length})
        </button>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-600 font-medium">Loading mentorship requests...</p>
        </div>
      ) : error ? (
        <Card className="p-8 text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="font-semibold">Unable to load mentorship requests</p>
          <p className="text-xs text-slate-500 mt-1">Please ensure you are signed in as a registered mentor.</p>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className="p-12 text-center">
          <GraduationCap className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No requests found in this view</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            When candidates discover your mentor profile in the Mentors Directory, their requests will appear here for your review.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <Card key={req.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{req.candidate_name || 'Candidate'}</span>
                    {getStatusBadge(req.status)}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-600">{req.headline || 'Software Developer'}</p>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">Career & Skill Goals:</span>
                      <p className="text-slate-600">{req.goals}</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">Candidate Note:</span>
                      <p className="text-slate-600 italic">"{req.message}"</p>
                    </div>

                    {req.feedback && (
                      <div className="pt-2 border-t border-slate-200">
                        <span className="font-bold text-teal-800 block mb-0.5">Your Guidance Notes:</span>
                        <p className="text-slate-700">{req.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  {req.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleOpenAction(req, 'accept')}
                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAction(req, 'decline')}
                        className="gap-1.5 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Decline
                      </Button>
                    </>
                  )}

                  {req.status === 'accepted' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAction(req, 'complete')}
                      className="gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Update / Complete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {selectedRequest && actionType && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedRequest(null);
            setActionType(null);
          }}
          title={
            actionType === 'accept'
              ? 'Accept Mentorship Request'
              : actionType === 'decline'
              ? 'Decline Request'
              : 'Complete Mentorship & Provide Summary'
          }
        >
          <form onSubmit={handleSubmitAction} className="space-y-4">
            <p className="text-sm text-slate-600">
              {actionType === 'accept'
                ? `You are accepting ${selectedRequest.candidate_name}'s request for mentorship. Share your availability or initial guidance below.`
                : actionType === 'decline'
                ? `Please let ${selectedRequest.candidate_name} know why you cannot take on this mentorship currently.`
                : `Record closing feedback and recommendations for ${selectedRequest.candidate_name}.`}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Guidance & Feedback Notes (Shared with Candidate)
              </label>
              <textarea
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="Suggest recommended study tracks, project ideas, or next meeting availability..."
                rows={4}
                required
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedRequest(null);
                  setActionType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={updateRequestMutation.isPending}
                className={
                  actionType === 'decline'
                    ? 'bg-red-600 hover:bg-red-700'
                    : actionType === 'accept'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : ''
                }
              >
                {actionType === 'accept' ? 'Confirm Acceptance' : actionType === 'decline' ? 'Confirm Decline' : 'Save Feedback'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
