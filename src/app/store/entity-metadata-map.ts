import { EntityDataModuleConfig, EntityMetadataMap } from '@ngrx/data';
import { Organization } from '../types/organization';
import { newIdFromSelfSubjectAccessReview, SelfSubjectAccessReview } from '../types/self-subject-access-review';
import { OrganizationMembers } from '../types/organization-members';
import { BillingEntity } from '../types/billing-entity';
import { RoleBinding } from '../types/role-binding';
import { Team } from '../types/team';

export const organizationEntityKey = 'organization.appuio.io/v1/organizations';
export const organizationMembersEntityKey = 'appuio.io/v1/organizationmembers';
export const selfSubjectAccessReviewEntityKey = 'authorization.k8s.io/v1/selfsubjectaccessreviews';
export const billingEntityEntityKey = 'billing.appuio.io/v1/billingentities';
export const rolebindingEntityKey = 'rbac.authorization.k8s.io/v1/rolebindings';
export const teamEntityKey = 'appuio.io/v1/teams';

const pluralNames = {};
export const entityMetadataMap: EntityMetadataMap = {
  Organization: {
    selectId: (org: Organization) => org.metadata.name,
    entityName: organizationEntityKey,
    sortComparer: (a: Organization, b: Organization) =>
      a.metadata.name.localeCompare(b.metadata.name, undefined, { sensitivity: 'base' }),
    filterFn: (entities: Organization[], filterFn: (orgs: Organization[]) => Organization[]) => filterFn(entities),
  },
  SelfSubjectAccessReview: {
    selectId: (ssar: SelfSubjectAccessReview) => newIdFromSelfSubjectAccessReview(ssar),
    entityName: selfSubjectAccessReviewEntityKey,
  },
  OrganizationMembers: {
    entityName: organizationMembersEntityKey,
    selectId: (members: OrganizationMembers) => `${members.metadata.namespace}/${members.metadata.name}`,
    sortComparer: (a: OrganizationMembers, b: OrganizationMembers) =>
      a.metadata.namespace.localeCompare(b.metadata.namespace, undefined, { sensitivity: 'base' }),
    filterFn: (entities: OrganizationMembers[], filterFn: (members: OrganizationMembers) => boolean) =>
      entities.filter((members) => filterFn(members)),
  },
  BillingEntity: {
    entityName: billingEntityEntityKey,
    selectId: (bEntity: BillingEntity) => bEntity.metadata.name, // cluster-scoped
    sortComparer: (a: BillingEntity, b: BillingEntity) =>
      a.metadata.name.localeCompare(b.metadata.name, undefined, { sensitivity: 'base' }),
  },
  RoleBinding: {
    entityName: rolebindingEntityKey,
    selectId: (rb: RoleBinding) => `${rb.metadata.namespace}/${rb.metadata.name}`,
    sortComparer: (a: RoleBinding, b: RoleBinding) =>
      `${a.metadata.namespace}/${a.metadata.name}`.localeCompare(
        `${b.metadata.namespace}/${b.metadata.name}`,
        undefined,
        { sensitivity: 'base' }
      ),
  },
  Team: {
    entityName: teamEntityKey,
    selectId: (team: Team) => `${team.metadata.namespace}/${team.metadata.name}`,
    sortComparer: (a: Team, b: Team) =>
      `${a.metadata.namespace}/${a.metadata.name}`.localeCompare(
        `${b.metadata.namespace}/${b.metadata.name}`,
        undefined,
        { sensitivity: 'base' }
      ),
  },
};

export const entityConfig: EntityDataModuleConfig = {
  entityMetadata: entityMetadataMap,
  pluralNames,
};
