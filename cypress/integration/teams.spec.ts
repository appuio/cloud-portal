import { createUser, userMigWithoutPreferences } from './user.spec';
import { Team, UserRef } from '../../src/app/types/team';
import { List } from '../../src/app/types/list';
import { organizationListNxtVshn } from './organizations.spec';

describe('Test teams list', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
  });

  it('list with two entries', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    cy.visit('/teams');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: teamsNxt,
    });
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'team1');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'team2');
  });

  it('list with one team and user with default organization', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'vshn' }),
    });

    cy.visit('/teams');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/vshn/teams', {
      body: teamsVshn,
    });
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'tarazed');
  });

  it('list with one team and user with default organization and change of selected organization', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'vshn' }),
    });

    cy.visit('/teams');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/vshn/teams', {
      body: teamsVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: teamsNxt,
    });
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'tarazed');
    cy.get('.p-dropdown-trigger-icon').click();
    cy.get('#pr_id_4_list > :nth-child(1)').click();
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'team1');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'team2');
  });

  it('empty list', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    cy.visit('/teams');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: createTeamList({ items: [] }),
    });
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get('#no-teams-message').should('contain.text', 'No teams available.');
  });

  it('request failed', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    cy.visit('/teams');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.visit('/teams');
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      statusCode: 403,
    });
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get('#teams-failure-message').should('contain.text', 'Teams could not be loaded.');
  });
});

describe('Test team edit', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
  });

  it('edit team with button', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    cy.setPermission({ verb: 'update', resource: 'teams', group: 'appuio.io', namespace: 'nxt' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: teamsNxt,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams/team1', {
      body: team1,
    });
    cy.visit('/teams');

    const updatedTeam: Team = {
      ...team1,
      spec: {
        ...team1.spec,
        displayName: 'Awesome Team!',
      },
    };
    cy.intercept('PUT', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams/team1', {
      body: updatedTeam,
      statusCode: 200,
    }).as('update');

    cy.get('#teams-title').should('contain.text', 'Teams');

    cy.get(':nth-child(2) > .flex-row > :nth-child(2) > [title="Edit team"]').click();

    cy.get('.text-3xl').should('contain.text', 'team1');
    cy.get('#displayName').type('{selectall}');
    cy.get('#displayName').type('Awesome Team!');

    cy.get(':nth-child(3) > :nth-child(3) > .p-ripple').click();
    cy.get(':nth-child(3) > .p-inputtext').type('cma');
    cy.get('button[type=submit]').click();
    cy.get('@update')
      .its('request.body')
      .then((body) => {
        expect(body.metadata.name).to.eq('team1');
        expect(body.spec.displayName).to.eq('Awesome Team!');
        expect(body.spec.userRefs[0].name).to.eq('mig');
        expect(body.spec.userRefs[1].name).to.eq('cma');
      });
  });

  it('no edit permission', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: teamsNxt,
    });
    cy.visit('/teams');
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'team1');
    cy.get(':nth-child(2) > .flex-row > :nth-child(2) > [title="Edit team"]').should('not.exist');
  });
});

describe('Test teams add', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
  });

  it('add team with button', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    cy.setPermission(
      { verb: 'create', resource: 'teams', group: 'appuio.io', namespace: 'nxt' },
      { verb: 'update', resource: 'teams', group: 'appuio.io', namespace: 'nxt' }
    );
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: teamsNxt,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams/team1', {
      body: team1,
    });
    cy.visit('/teams');

    const updatedTeam: Team = {
      ...team1,
      spec: {
        ...team1.spec,
        displayName: 'Awesome Team!',
      },
    };
    cy.intercept('POST', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: updatedTeam,
      statusCode: 200,
    }).as('create');

    cy.get('#teams-title').should('contain.text', 'Teams');

    cy.get('#addTeamButton').click();

    cy.get('.text-3xl > .ng-star-inserted').should('contain.text', 'New Team');

    cy.get('#name').type('new-team');
    cy.get('#displayName').type('New Team!');

    cy.get('.flex > .p-inputtext').type('test');
    cy.get('button[type=submit]').click();
    cy.get('@create')
      .its('request.body')
      .then((body) => {
        expect(body.metadata.name).to.eq('new-team');
        expect(body.spec.displayName).to.eq('New Team!');
        expect(body.spec.userRefs[0].name).to.eq('test');
      });
  });

  it('no create permission', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    cy.setPermission({ verb: 'update', resource: 'teams', group: 'appuio.io', namespace: 'nxt' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: teamsNxt,
    });
    cy.visit('/teams');
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get('#addTeamButton').should('not.exist');
  });
});

describe('Test teams delete', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
  });

  it('delete team with button', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    cy.setPermission({ verb: 'delete', resource: 'teams', group: 'appuio.io', namespace: 'nxt' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: teamsNxt,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams/team1', {
      body: team1,
    });
    cy.visit('/teams');

    cy.intercept('DELETE', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams/team1', {
      statusCode: 200,
    }).as('delete');

    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > :nth-child(2) > [title="Delete team"]').click();
    cy.get('.p-confirm-dialog-message').should(
      'contain.text',
      // eslint-disable-next-line quotes
      "Are you sure that you want to delete the team 'My Super Team 1'?"
    );
    cy.get('.p-confirm-dialog-accept').click();
    cy.wait('@delete');
  });

  it('no delete permission', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: teamsNxt,
    });
    cy.visit('/teams');
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'team1');

    cy.get(':nth-child(2) > .flex-row > :nth-child(2) > [title="Delete team"]').should('not.exist');
  });
});

export interface TeamConfig {
  name: string;
  namespace: string;
  displayName: string;
  userRefs: UserRef[];
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

export const teamsNxt = createTeamList({
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
  ],
});

export const teamsVshn = createTeamList({
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
      displayName: teamConfig.displayName,
      userRefs: teamConfig.userRefs,
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
