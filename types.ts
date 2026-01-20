
export enum FitLevel {
  EXCELLENT = 'Excellent',
  STRONG = 'Strong',
  MODERATE = 'Moderate',
  WEAK = 'Weak'
}

export interface SkillAlignmentRow {
  category: string;
  jobRequires: string;
  foundInResume: string;
  match: string;
}

export interface KeywordGaps {
  critical: string[];
  niceToHave: string[];
}

export interface ImprovementSuggestions {
  bulletRewrites: string[];
  skillsToHighlight: string[];
  experienceFraming: string[];
}

export interface AnalysisResult {
  matchScore: number;
  fitLevel: FitLevel;
  skillAlignment: SkillAlignmentRow[];
  strengths: string[];
  missingOrWeak: string[];
  keywordGaps: KeywordGaps;
  suggestions: ImprovementSuggestions;
  verdict: string;
}
