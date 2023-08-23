import { Team, UserRef } from '../../src/app/types/team';
import { List } from '../../src/app/types/list';

export interface TeamConfig {
  name: string;
  namespace: string;
  displayName?: string;
  userRefs?: UserRef[];
}

export interface TeamListConfig {
  items: Team[];
}

export const team1 = createTeam({
  name: 'team1',
  namespace: 'nxt',
  displayName: 'My Super Team 1',
  userRefs: [{ name: 'mig' }, { name: 'miw' }],
});

export const teamListNxt = createTeamList({
  items: [
    createTeam({
      name: 'team1',
      namespace: 'nxt',
      displayName: 'My Super Team 1',
      userRefs: [{ name: 'mig' }, { name: 'miw' }],
    }),
    createTeam({
      name: 'team2',
      namespace: 'nxt',
      displayName: 'My Super Team 2',
      userRefs: [{ name: 'cma' }],
    }),
    createTeam({
      name: 'team-no-display-name',
      namespace: 'nxt',
      userRefs: [{ name: 'ste' }],
    }),
  ],
});
export const teamListVshn = createTeamList({
  items: [
    createTeam({
      name: 'tarazed',
      namespace: 'vshn',
      displayName: 'Tarazed',
      userRefs: [{ name: 'corvus' }],
    }),
  ],
});

export function createTeam(teamConfig: TeamConfig): Team {
  return {
    apiVersion: 'appuio.io/v1',
    kind: 'Team',
    metadata: {
      name: teamConfig.name,
      namespace: teamConfig.namespace,
    },
    spec: {
      displayName: teamConfig.displayName ? teamConfig.displayName : '',
      userRefs: teamConfig.userRefs ? teamConfig.userRefs : [],
    },
  };
}

export function createTeamList(teamListConfig: TeamListConfig): List<Team> {
  return {
    apiVersion: 'v1',
    kind: 'List',
    items: teamListConfig.items,
    metadata: {
      resourceVersion: '',
      selfLink: '',
    },
  };
}

export function setTeam(cy: Cypress.cy, namespace: string, ...teams: Team[]): void {
  cy.intercept('GET', `appuio-api/apis/appuio.io/v1/namespaces/${namespace}/teams`, {
    body: { items: [...teams] },
  }).as(`teamList-${namespace}`);
}
