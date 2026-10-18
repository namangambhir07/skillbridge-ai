
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, CheckCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand Column */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>

              <span className="font-extrabold text-white text-lg tracking-tight">
                SkillBridge<span className="text-teal-400">.AI</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Better Matches. Faster Hiring. Real Opportunities.
              Continuous evidence-based recruitment and skill development.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-teal-400 font-medium">
              <Shield className="w-3.5 h-3.5" />
              Powered by Trace Assessment Engine
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Discovery
            </h4>

            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors">
                  Jobs & Internships
                </Link>
              </li>
              <li>
                <Link
                  to="/community/startups"
                  className="hover:text-white transition-colors"
                >
                  Startups & Co-Founders
                </Link>
              </li>
              <li>
                <Link
                  to="/community/mentors"
                  className="hover:text-white transition-colors"
                >
                  Find a Mentor
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="hover:text-white transition-colors"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Philosophy */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Continuous Loop
            </h4>

            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                Apply & Match
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                Trace Practical Task
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                Objective Feedback
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                Mini-Project Evidence
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                Evidence-Based Reapplication
              </li>
            </ul>
          </div>

          {/* Hackathon Attribution */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Hackathon Context
            </h4>

            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              Built for{' '}
              <strong className="text-white">HackShift Hackathon</strong>.
            </p>

            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-white">Problem Statement 2:</strong>{' '}
              Entrepreneurship & Employment.
            </p>

            <div className="mt-3 text-[11px] text-slate-500 leading-relaxed">
              Deterministic matching • Telemetry context, not accusations •
              Real employer verification.
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">

          {/* Copyright */}
          <div className="text-center sm:text-left">
            © 2026 SkillBridge AI. All rights reserved. Prototype demonstration.
          </div>

          {/* Made with Love */}
          <div className="flex items-center justify-center gap-1.5">
            <span>Made with</span>
            <span role="img" aria-label="love">
              ❤️
            </span>
            <span>by</span>
            <span className="font-semibold text-teal-400">
              Team October
            </span>
          </div>

          {/* Policy Labels */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-center">
            <span>
              Privacy & Consent Telemetry Policy
            </span>

            <span aria-hidden="true">•</span>

            <span>
              Employer Verification Standards
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
};
