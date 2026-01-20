
import React from 'react';
import { AnalysisResult } from '../types';
import ScoreCard from './ScoreCard';
import AlignmentTable from './AlignmentTable';

interface ResultSectionProps {
  result: AnalysisResult;
}

const ResultSection: React.FC<ResultSectionProps> = ({ result }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Section: Score & Verdict */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ScoreCard score={result.matchScore} level={result.fitLevel} />
        </div>
        <div className="lg:col-span-2 flex flex-col justify-center p-8 glass-card rounded-2xl border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recruiter Verdict
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg italic">
            "{result.verdict}"
          </p>
        </div>
      </div>

      {/* Alignment Table */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Skill Alignment Matrix
        </h3>
        <AlignmentTable data={result.skillAlignment} />
      </div>

      {/* Strengths and Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
          <h4 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Key Strengths
          </h4>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-emerald-800 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
          <h4 className="font-bold text-rose-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            Missing or Weak Areas
          </h4>
          <ul className="space-y-2">
            {result.missingOrWeak.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-rose-800 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Keyword Gaps */}
      <div className="p-6 glass-card rounded-2xl border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Keyword & Skill Gaps
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Critical Missing</span>
            <div className="flex flex-wrap gap-2">
              {result.keywordGaps.critical.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Nice-to-Have Missing</span>
            <div className="flex flex-wrap gap-2">
              {result.keywordGaps.niceToHave.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-white text-gray-500 rounded-lg text-sm border border-gray-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="p-8 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-100">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.364-6.364l-.707-.707m1.414 14.142l-.707-.707M15.818 17.818l-.707-.707M12 7a5 5 0 00-5 5c0 2.485 2.099 4.5 4.688 4.5 1.935 0 3.597-1.126 4.312-2.733-.715-1.607-2.377-2.733-4.312-2.733z" />
          </svg>
          Actionable Improvements
        </h3>
        <div className="space-y-6">
          <section>
            <h4 className="text-blue-100 text-sm font-semibold uppercase tracking-widest mb-3">Suggested Bullet Rewrites</h4>
            <div className="space-y-3">
              {result.suggestions.bulletRewrites.map((r, i) => (
                <div key={i} className="p-4 bg-white/10 rounded-xl border border-white/20 text-sm leading-relaxed">
                  {r}
                </div>
              ))}
            </div>
          </section>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <h4 className="text-blue-100 text-sm font-semibold uppercase tracking-widest mb-3">Skills to Highlight</h4>
              <ul className="list-disc list-inside space-y-2 text-sm opacity-90">
                {result.suggestions.skillsToHighlight.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </section>
            <section>
              <h4 className="text-blue-100 text-sm font-semibold uppercase tracking-widest mb-3">Framing Improvements</h4>
              <ul className="list-disc list-inside space-y-2 text-sm opacity-90">
                {result.suggestions.experienceFraming.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultSection;
