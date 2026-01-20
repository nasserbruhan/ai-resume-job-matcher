
import React from 'react';
import { FitLevel } from '../types';

interface ScoreCardProps {
  score: number;
  level: FitLevel;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ score, level }) => {
  const getLevelColor = (lvl: FitLevel) => {
    switch (lvl) {
      case FitLevel.EXCELLENT: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case FitLevel.STRONG: return 'text-blue-600 bg-blue-50 border-blue-200';
      case FitLevel.MODERATE: return 'text-amber-600 bg-amber-50 border-amber-200';
      case FitLevel.WEAK: return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCircleColor = (lvl: FitLevel) => {
    switch (lvl) {
      case FitLevel.EXCELLENT: return 'stroke-emerald-500';
      case FitLevel.STRONG: return 'stroke-blue-500';
      case FitLevel.MODERATE: return 'stroke-amber-500';
      case FitLevel.WEAK: return 'stroke-rose-500';
      default: return 'stroke-gray-400';
    }
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-card rounded-2xl shadow-sm h-full">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            className="text-gray-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="64"
            cy="64"
          />
          <circle
            className={getCircleColor(level)}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="64"
            cy="64"
          />
        </svg>
        <span className="absolute text-3xl font-bold text-gray-800">{score}%</span>
      </div>
      <div className={`mt-4 px-4 py-1.5 rounded-full border text-sm font-semibold tracking-wide uppercase ${getLevelColor(level)}`}>
        {level} Fit
      </div>
    </div>
  );
};

export default ScoreCard;
