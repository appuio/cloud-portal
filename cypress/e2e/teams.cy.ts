import { Team, TeamPermissions } from '../../src/app/types/team';
import { createUser, userMigWithoutPreferences } from '../fixtures/user';
import { createTeamList, setTeam, team1, teamListNxt, teamListVshn } from '../fixtures/team';
import { organizationListNxtVshn, setOrganization } from '../fixtures/organization';

describe('Test teams list', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
  });

  it('list with two entries', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', ...TeamPermissions });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });
    setOrganization(cy, ...organizationListNxtVshn.items);
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: teamListNxt,
    });

    cy.visit('/teams');
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'My Super Team 1');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'My Super Team 2');
    cy.get(':nth-child(4) > .flex-row > .text-3xl').should('contain.text', 'team-no-display-name');
  });

  it('failed requests are retried', () => {
    cy.setPermission({ verb: 'list', ...TeamPermissions });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    setOrganization(cy, ...organizationListNxtVshn.items);

    let interceptCount = 0;
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', (req) => {
      if (interceptCount === 0) {
        interceptCount++;
        req.reply({ statusCode: 501 });
      } else {
        req.reply(teamListNxt);
      }
    });
    cy.visit('/teams');

    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'My Super Team 1');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'My Super Team 2');
  });

  it('list with one team and user with default organization', () => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'vshn' }),
    });
    cy.setPermission({ verb: 'list', ...TeamPermissions });
    setOrganization(cy, ...organizationListNxtVshn.items);
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/vshn/teams', {
      body: teamListVshn,
    });

    cy.visit('/teams');
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'Tarazed');
  });

  it('list with one team and user with default organization and change of selected organization', () => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'vshn' }),
    });
    cy.setPermission({ verb: 'list', ...TeamPermissions });

    setOrganization(cy, ...organizationListNxtVshn.items);
    setTeam(cy, 'vshn', ...teamListVshn.items);
    setTeam(cy, 'nxt', ...teamListNxt.items);

    cy.visit('/teams');
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'Tarazed');
    cy.get('app-organization-selection:visible').click().contains('nxt').click();
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'My Super Team 1');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'My Super Team 2');
  });

  it('empty list', () => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });
    cy.setPermission({ verb: 'list', ...TeamPermissions });
    setOrganization(cy, ...organizationListNxtVshn.items);
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: createTeamList({ items: [] }),
    });

    cy.visit('/teams');
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get('#no-teams-message').should('contain.text', 'No teams available.');
  });

  it('request failed', () => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });
    cy.setPermission({ verb: 'list', ...TeamPermissions });

    cy.visit('/teams');

    setOrganization(cy, ...organizationListNxtVshn.items);
    cy.visit('/teams');
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      statusCode: 403,
    });
    cy.get('#teams-failure-message').should('contain.text', 'Teams could not be loaded.');
  });

  it('no organizations available', () => {
    cy.setPermission({ verb: 'list', ...TeamPermissions });
    setOrganization(cy);

    cy.visit('/teams');
    cy.get('#no-teams-message').should('contain.text', 'No teams available.');
  });
});

describe('Test team edit', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
  });

  it('edit team with button', () => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    cy.setPermission({ verb: 'update', namespace: 'nxt', ...TeamPermissions });
    setOrganization(cy, ...organizationListNxtVshn.items);
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: teamListNxt,
    });
    cy.visit('/teams');

    const updatedTeam: Team = {
      ...team1,
      spec: {
        ...team1.spec,
        displayName: 'Awesome Team!',
      },
    };
    cy.intercept('PATCH', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams/team1', {
      body: updatedTeam,
      statusCode: 200,
    }).as('update');

    cy.get('#teams-title').should('contain.text', 'Teams');

    cy.get(':nth-child(2) > .flex-row > :nth-child(2) > [title="Edit team"]').click();

    cy.get('.text-3xl').should('contain.text', 'team1');
    cy.get('#displayName').type('{selectall}Awesome Team! ');

    cy.get(':nth-child(3) > :nth-child(3) > .p-ripple').click();
    cy.get(':nth-child(3) > .p-inputtext').type('cma ');
    cy.get('button[type=submit]').click();
    cy.wait('@update');
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
    cy.setPermission({ verb: 'list', namespace: 'nxt', ...TeamPermissions });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    setOrganization(cy, ...organizationListNxtVshn.items);
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: teamListNxt,
    });
    cy.visit('/teams');
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'My Super Team 1');
    cy.get(':nth-child(2) > .flex-row > :nth-child(2) > [title="Edit team"]').should('not.exist');
  });
});

describe('Test teams add', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
  });

  it('add team with button', () => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    cy.setPermission(
      { verb: 'list', ...TeamPermissions },
      { verb: 'create', ...TeamPermissions, namespace: 'nxt' },
      { verb: 'update', ...TeamPermissions, namespace: 'nxt' }
    );
    setOrganization(cy, ...organizationListNxtVshn.items);
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: teamListNxt,
    });
    cy.visit('/teams');

    const updatedTeam: Team = {
      ...team1,
      metadata: {
        ...team1.metadata,
        name: 'new-team',
      },
      spec: {
        ...team1.spec,
        displayName: 'New Team!',
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
    cy.get('#displayName').type(' New Team! ');

    cy.get('.flex > .p-inputtext').type('test ');
    cy.get('button[type=submit]').click();
    cy.wait('@create');
    cy.get('@create')
      .its('request.body')
      .then((body) => {
        expect(body.metadata.name).to.eq('new-team');
        expect(body.spec.displayName).to.eq('New Team!');
        expect(body.spec.userRefs[0].name).to.eq('test');
      });
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'New Team');
  });

  it('no create permission', () => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    cy.setPermission({ verb: 'update', ...TeamPermissions, namespace: 'nxt' });
    setOrganization(cy, ...organizationListNxtVshn.items);

    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: teamListNxt,
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
    cy.disableCookieBanner();
  });

  it('delete team with button', () => {
    // needed for initial getUser request
    cy.setPermission(
      { verb: 'list', namespace: 'nxt', ...TeamPermissions },
      { verb: 'delete', namespace: 'nxt', ...TeamPermissions }
    );
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    setOrganization(cy, ...organizationListNxtVshn.items);

    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: teamListNxt,
    });

    cy.intercept('DELETE', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams/team1', {
      statusCode: 200,
    }).as('delete');

    cy.visit('/teams');

    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > :nth-child(2) > [title="Delete team"]').click();
    cy.get('.p-confirm-dialog-message').should(
      'contain.text',
      // eslint-disable-next-line quotes
      "Are you sure that you want to delete the team 'My Super Team 1'?"
    );
    cy.get('.p-confirm-dialog-accept').click();
    cy.wait('@delete');
    cy.get(':nth-child(2) > .flex-row > :nth-child(1)').should('not.contain.text', 'My Super Team 1');
  });

  it('no delete permission', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', namespace: 'nxt', ...TeamPermissions });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    setOrganization(cy, ...organizationListNxtVshn.items);
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: teamListNxt,
    });
    cy.visit('/teams');
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'My Super Team 1');

    cy.get(':nth-child(2) > .flex-row > :nth-child(2) > [title="Delete team"]').should('not.exist');
  });
});
