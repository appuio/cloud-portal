export interface Rule {
  verbs: string[];
  apiGroups: string[];
  resources?: string[];
  resourceNames?: string[];
}
