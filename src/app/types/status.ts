export interface Condition {
  status: 'True' | 'False' | 'Unknown';
  type: string;
  message?: string;
  lastTransitionTime?: string;
}
