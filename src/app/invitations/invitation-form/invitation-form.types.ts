import { Organization } from '../../types/organization';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { BillingEntity } from '../../types/billing-entity';
import { Team } from '../../types/team';

export interface InvitationForm {
  note: FormControl<string>;
  email: FormControl<string>;
  organizationTargets: FormArray<FormGroup<OrganizationTarget>>;
  billingTargets: FormArray<FormGroup<BillingTarget>>;
}

export interface OrganizationTarget {
  organization: FormControl<OrganizationOption | undefined>;
  isViewer: FormControl<boolean>;
  isAdmin: FormControl<boolean>;
  teams: FormControl<TeamOption[] | undefined>;
  selectableTeams: FormControl<TeamOption[] | undefined>;
}

export interface OrganizationOption {
  organization: Organization;
  displayName: string;
}

export interface BillingOption {
  billingEntity: BillingEntity;
  displayName: string;
}

export interface TeamOption {
  team: Team;
  displayName: string;
}

export interface BillingTarget {
  billing: FormControl<BillingOption | undefined>;
  isViewer: FormControl<boolean>;
  isAdmin: FormControl<boolean>;
}
