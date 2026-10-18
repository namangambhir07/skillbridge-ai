import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { evaluateAdaptation } from '../services/adaptationEvaluator.js';

export const assessmentRouter = Router();

assessmentRouter.get('/templates', (_req, res) => {
  try {
    const templates = db.prepare(`
      SELECT * FROM assessments WHERE job_id IS NULL OR status = 'published'
    `).all();
    res.json({ templates });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch templates', details: err.message });
  }
});

assessmentRouter.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(req.params.id) as any;
    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    let job = null;
    if (assessment.job_id) {
      job = db.prepare(`
        SELECT j.id, j.title, ep.org_name
        FROM jobs j
        JOIN employer_profiles ep ON ep.id = j.employer_id
        WHERE j.id = ?
      `).get(assessment.job_id);
    }

    res.json({ assessment, job });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch assessment', details: err.message });
  }
});

assessmentRouter.post('/:id/sessions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const assessmentId = req.params.id;
    const { applicationId } = req.body;

    const candProfile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as any;
    if (!candProfile) {
      res.status(403).json({ error: 'Only candidates can start assessment sessions' });
      return;
    }

    // Check if session already exists
    let session = db.prepare(`
      SELECT * FROM assessment_sessions
      WHERE assessment_id = ? AND candidate_id = ?
    `).get(assessmentId, candProfile.id) as any;

    if (!session) {
      const sessionId = 'ses_' + crypto.randomUUID().slice(0, 8);
      db.prepare(`
        INSERT INTO assessment_sessions (id, assessment_id, candidate_id, application_id, status)
        VALUES (?, ?, ?, ?, 'not_started')
      `).run(sessionId, assessmentId, candProfile.id, applicationId || null);

      session = db.prepare('SELECT * FROM assessment_sessions WHERE id = ?').get(sessionId);
    }

    const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(assessmentId);

    // Fetch initial and revision submissions if any
    const submissions = db.prepare(`
      SELECT * FROM assessment_submissions WHERE session_id = ? ORDER BY submitted_at ASC
    `).all(session.id);

    res.json({ session, assessment, submissions });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to initialize assessment session', details: err.message });
  }
});

assessmentRouter.post('/sessions/:id/consent', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = req.params.id;
    const session = db.prepare('SELECT * FROM assessment_sessions WHERE id = ?').get(sessionId) as any;

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    db.prepare(`
      UPDATE assessment_sessions
      SET consent_accepted_at = CURRENT_TIMESTAMP,
          started_at = COALESCE(started_at, CURRENT_TIMESTAMP),
          status = CASE WHEN status = 'not_started' THEN 'in_progress' ELSE status END
      WHERE id = ?
    `).run(sessionId);

    // Log telemetry event for consent
    const nextSeq = ((db.prepare('SELECT MAX(event_sequence) as max_seq FROM telemetry_events WHERE session_id = ?').get(sessionId) as any)?.max_seq || 0) + 1;

    db.prepare(`
      INSERT INTO telemetry_events (id, session_id, event_type, metadata, event_sequence)
      VALUES (?, ?, 'consent_accepted', ?, ?)
    `).run(
      'tel_' + crypto.randomUUID().slice(0, 8),
      sessionId,
      JSON.stringify({ notice: 'Telemetry metadata consent granted by candidate' }),
      nextSeq
    );

    res.json({ message: 'Consent recorded successfully', status: 'in_progress' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record consent', details: err.message });
  }
});

assessmentRouter.post('/sessions/:id/events', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = req.params.id;
    const { event_type, metadata } = req.body;

    const session = db.prepare('SELECT * FROM assessment_sessions WHERE id = ?').get(sessionId) as any;
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (!session.consent_accepted_at) {
      res.status(400).json({ error: 'Telemetry cannot be logged prior to candidate consent.' });
      return;
    }

    const nextSeq = ((db.prepare('SELECT MAX(event_sequence) as max_seq FROM telemetry_events WHERE session_id = ?').get(sessionId) as any)?.max_seq || 0) + 1;

    // Filter safe metadata only (no full clipboard or invasive details)
    const safeMetadata = {
      timestamp: new Date().toISOString(),
      source: metadata?.source || 'editor',
      changeLength: metadata?.changeLength || 0,
      pasteLength: metadata?.pasteLength || 0,
    };

    db.prepare(`
      INSERT INTO telemetry_events (id, session_id, event_type, metadata, event_sequence)
      VALUES (?, ?, ?, ?, ?)
    `).run('tel_' + crypto.randomUUID().slice(0, 8), sessionId, event_type, JSON.stringify(safeMetadata), nextSeq);

    // Increment session counters
    if (event_type === 'paste_event') {
      db.prepare('UPDATE assessment_sessions SET paste_count = paste_count + 1 WHERE id = ?').run(sessionId);
    } else if (event_type === 'editor_change') {
      db.prepare('UPDATE assessment_sessions SET edit_count = edit_count + 1 WHERE id = ?').run(sessionId);
    }

    if (metadata?.elapsedSeconds) {
      db.prepare('UPDATE assessment_sessions SET elapsed_seconds = ? WHERE id = ?').run(metadata.elapsedSeconds, sessionId);
    }

    res.json({ received: true, eventSequence: nextSeq });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record telemetry', details: err.message });
  }
});

assessmentRouter.post('/sessions/:id/initial-submission', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = req.params.id;
    const { content, elapsedSeconds } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: 'Submission content cannot be empty' });
      return;
    }

    const session = db.prepare(`
      SELECT ass.*, a.follow_up_prompt
      FROM assessment_sessions ass
      JOIN assessments a ON a.id = ass.assessment_id
      WHERE ass.id = ?
    `).get(sessionId) as any;

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Save initial submission
    const subId = 'sub_' + crypto.randomUUID().slice(0, 8);
    db.prepare(`
      INSERT INTO assessment_submissions (id, session_id, submission_type, content)
      VALUES (?, ?, 'initial', ?)
    `).run(subId, sessionId, content);

    // Update session state to follow_up_active
    db.prepare(`
      UPDATE assessment_sessions
      SET status = 'follow_up_active',
          elapsed_seconds = COALESCE(?, elapsed_seconds)
      WHERE id = ?
    `).run(elapsedSeconds || null, sessionId);

    // Log telemetry
    const nextSeq = ((db.prepare('SELECT MAX(event_sequence) as max_seq FROM telemetry_events WHERE session_id = ?').get(sessionId) as any)?.max_seq || 0) + 1;
    db.prepare(`
      INSERT INTO telemetry_events (id, session_id, event_type, metadata, event_sequence)
      VALUES (?, ?, 'initial_submit', ?, ?)
    `).run('tel_' + crypto.randomUUID().slice(0, 8), sessionId, JSON.stringify({ length: content.length }), nextSeq);

    res.json({
      message: 'Initial task submitted. Dynamic follow-up scenario activated.',
      status: 'follow_up_active',
      followUpPrompt: session.follow_up_prompt,
      initialContent: content,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Initial submission failed', details: err.message });
  }
});

assessmentRouter.post('/sessions/:id/revision-submission', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = req.params.id;
    const { content, candidate_explanation, elapsedSeconds } = req.body;

    if (!content || !candidate_explanation) {
      res.status(400).json({ error: 'Both revised content and an explanation of your changes are required' });
      return;
    }

    const session = db.prepare(`
      SELECT ass.*, a.follow_up_prompt, a.title as assessment_title, a.job_id
      FROM assessment_sessions ass
      JOIN assessments a ON a.id = ass.assessment_id
      WHERE ass.id = ?
    `).get(sessionId) as any;

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const initialSub = db.prepare(`
      SELECT content FROM assessment_submissions
      WHERE session_id = ? AND submission_type = 'initial'
    `).get(sessionId) as any;

    const initialContent = initialSub ? initialSub.content : '';

    // Save revision submission
    const subId = 'sub_' + crypto.randomUUID().slice(0, 8);
    db.prepare(`
      INSERT INTO assessment_submissions (id, session_id, submission_type, content, candidate_explanation)
      VALUES (?, ?, 'revision', ?, ?)
    `).run(subId, sessionId, content, candidate_explanation);

    // Run transparent adaptation rubric evaluation
    const rubricResult = evaluateAdaptation(
      initialContent,
      content,
      candidate_explanation,
      session.follow_up_prompt
    );

    // Persist evaluation
    db.prepare(`
      INSERT OR REPLACE INTO adaptation_evaluations (
        id, session_id, addresses_requirement, relevance_score, explanation_quality,
        rubric_breakdown, feedback_summary
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'eva_' + crypto.randomUUID().slice(0, 8),
      sessionId,
      rubricResult.addressesRequirementScore / 100,
      rubricResult.relevanceScore / 100,
      rubricResult.explanationQualityScore / 100,
      JSON.stringify(rubricResult.rubricItems),
      rubricResult.evaluationSummary
    );

    // Mark session completed
    db.prepare(`
      UPDATE assessment_sessions
      SET status = 'completed',
          completed_at = CURRENT_TIMESTAMP,
          elapsed_seconds = COALESCE(?, elapsed_seconds)
      WHERE id = ?
    `).run(elapsedSeconds || null, sessionId);

    // Update application status to assessment_submitted if linked
    if (session.application_id) {
      db.prepare(`
        UPDATE applications
        SET status = 'assessment_submitted', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(session.application_id);

      db.prepare(`
        INSERT INTO application_status_history (id, application_id, status, notes, changed_by)
        VALUES (?, ?, 'assessment_submitted', 'Candidate completed Trace assessment and dynamic follow-up revision.', ?)
      `).run('ash_' + crypto.randomUUID().slice(0, 8), session.application_id, req.user!.userId);

      // Notify employer
      if (session.job_id) {
        const job = db.prepare('SELECT employer_id, title FROM jobs WHERE id = ?').get(session.job_id) as any;
        if (job) {
          const empUser = db.prepare('SELECT user_id FROM employer_profiles WHERE id = ?').get(job.employer_id) as any;
          if (empUser) {
            db.prepare(`
              INSERT INTO notifications (id, user_id, title, message, link)
              VALUES (?, ?, 'Assessment Evidence Ready for Review', ?, ?)
            `).run(
              'not_' + crypto.randomUUID().slice(0, 8),
              empUser.user_id,
              `${req.user!.name} completed the Trace assessment for "${job.title}".`,
              `/trace/report/${sessionId}`
            );
          }
        }
      }
    }

    // Log revision telemetry
    const nextSeq = ((db.prepare('SELECT MAX(event_sequence) as max_seq FROM telemetry_events WHERE session_id = ?').get(sessionId) as any)?.max_seq || 0) + 1;
    db.prepare(`
      INSERT INTO telemetry_events (id, session_id, event_type, metadata, event_sequence)
      VALUES (?, ?, 'revision_submit', ?, ?)
    `).run('tel_' + crypto.randomUUID().slice(0, 8), sessionId, JSON.stringify({ length: content.length, explanationLength: candidate_explanation.length }), nextSeq);

    res.json({
      message: 'Assessment completed! Your Trace evidence report is now generated.',
      status: 'completed',
      rubricResult,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Revision submission failed', details: err.message });
  }
});

assessmentRouter.get('/sessions/:id/report', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = req.params.id;
    const session = db.prepare(`
      SELECT ass.*, a.title as assessment_title, a.task_type, a.initial_prompt, a.follow_up_prompt,
             a.evaluation_criteria, a.job_id,
             u.name as candidate_name, u.email as candidate_email,
             cp.headline as candidate_headline, cp.id as candidate_profile_id,
             j.title as job_title, ep.org_name
      FROM assessment_sessions ass
      JOIN assessments a ON a.id = ass.assessment_id
      JOIN candidate_profiles cp ON cp.id = ass.candidate_id
      JOIN users u ON u.id = cp.user_id
      LEFT JOIN jobs j ON j.id = a.job_id
      LEFT JOIN employer_profiles ep ON ep.id = j.employer_id
      WHERE ass.id = ?
    `).get(sessionId) as any;

    if (!session) {
      res.status(404).json({ error: 'Assessment report not found' });
      return;
    }

    // Submissions
    const submissions = db.prepare(`
      SELECT * FROM assessment_submissions WHERE session_id = ? ORDER BY submitted_at ASC
    `).all(sessionId) as any[];

    const initialSubmission = submissions.find((s) => s.submission_type === 'initial');
    const revisionSubmission = submissions.find((s) => s.submission_type === 'revision');

    // Telemetry events
    const timeline = db.prepare(`
      SELECT id, event_type, metadata, event_sequence, created_at
      FROM telemetry_events
      WHERE session_id = ?
      ORDER BY event_sequence ASC
    `).all(sessionId);

    // Adaptation evaluation
    const evaluation = db.prepare(`
      SELECT * FROM adaptation_evaluations WHERE session_id = ?
    `).get(sessionId) as any;

    let rubricBreakdown = [];
    if (evaluation && evaluation.rubric_breakdown) {
      try {
        rubricBreakdown = JSON.parse(evaluation.rubric_breakdown);
      } catch {
        rubricBreakdown = [];
      }
    }

    // Associated feedback if already provided
    let feedback = null;
    if (session.application_id) {
      feedback = db.prepare(`
        SELECT cf.*, u.name as reviewer_name
        FROM candidate_feedback cf
        JOIN users u ON u.id = cf.reviewer_id
        WHERE cf.application_id = ?
      `).get(session.application_id);
    }

    res.json({
      report: {
        session,
        initialSubmission,
        revisionSubmission,
        timeline,
        telemetrySummary: {
          pasteCount: session.paste_count,
          editCount: session.edit_count,
          elapsedMinutes: session.elapsed_seconds ? Math.round(session.elapsed_seconds / 60) : 0,
          elapsedSeconds: session.elapsed_seconds || 0,
        },
        evaluation: evaluation
          ? {
              ...evaluation,
              rubricBreakdown,
            }
          : null,
        feedback,
        disclaimerNotice: 'Activity metadata provides context, not proof of cheating or authorship. Use the complete report and human judgment.',
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate evidence report', details: err.message });
  }
});
