export enum IncidentType {
  major = 'major',
  minor = 'minor',
  scheduled = 'scheduled',
}

export interface StatusPage {
  name: string;
  current_incident_type?: IncidentType;

  [key: string]: unknown;
}

export interface ChildService {
  name: string;
  id: string;
  parent_id: string;
  current_incident_type: IncidentType;
}

export interface Service {
  name: string;
  id: string;
  parent_id: string;
  current_incident_type: string;
  children: ChildService[];
}

export interface IncidentActivity {
  activity_type_id: string;
  description: string;
  notify: boolean;
  email_notify: boolean;
  slack_notify: boolean;
  tweet: boolean;
}

export interface Incident {
  title: string;
  starts_at: string;
  ends_at: string;
  type: IncidentType;
  service_ids: number[];
  incident_activities: IncidentActivity[];

  [key: string]: unknown;
}

export interface StatusPageStatus {
  status_page: StatusPage;
  services: Service[];
  incidents: Incident[];
  maintenances: Incident[];

  [key: string]: unknown;
}
