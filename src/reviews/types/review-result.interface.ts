export interface ReviewPositive {
  title: string;
  explanation: string;
}

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueCategory = 'quality' | 'security' | 'performance';

export interface ReviewIssue {
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  explanation: string;
  recommendation: string;
  diff?: string;
}

export interface ReviewResult {
  summary: string;
  positives: ReviewPositive[];
  issues: ReviewIssue[];
  suggestions: string[];
  questions: string[];
  overallScore: number;
}
