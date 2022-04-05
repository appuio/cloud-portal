describe('Test teams list', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
  });

  it('list with two entries', () => {
    cy.visit('/teams');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list.json',
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      fixture: 'teams.json',
    });
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'team1');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'team2');
  });

  it('empty list', () => {
    cy.visit('/teams');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list.json',
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      fixture: 'teams-empty.json',
    });
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get('#no-teams-message').should('contain.text', 'No teams available.');
  });

  it('request failed', () => {
    cy.visit('/teams');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list.json',
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
    cy.setPermission({ verb: 'update', resource: 'teams', group: 'appuio.io', namespace: 'nxt' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list.json',
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      fixture: 'teams.json',
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams/team1', {
      fixture: 'team1.json',
    });
    cy.visit('/teams');

    cy.intercept('PUT', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams/team1', {
      fixture: 'team1-update.json',
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
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list.json',
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      fixture: 'teams.json',
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
    cy.setPermission(
      { verb: 'create', resource: 'teams', group: 'appuio.io', namespace: 'nxt' },
      { verb: 'update', resource: 'teams', group: 'appuio.io', namespace: 'nxt' }
    );
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list.json',
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      fixture: 'teams.json',
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams/team1', {
      fixture: 'team1.json',
    });
    cy.visit('/teams');

    cy.intercept('POST', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      fixture: 'team1-update.json',
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
    cy.setPermission({ verb: 'update', resource: 'teams', group: 'appuio.io', namespace: 'nxt' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list.json',
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      fixture: 'teams.json',
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
    cy.setPermission({ verb: 'delete', resource: 'teams', group: 'appuio.io', namespace: 'nxt' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list.json',
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      fixture: 'teams.json',
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams/team1', {
      fixture: 'team1.json',
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
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list.json',
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      fixture: 'teams.json',
    });
    cy.visit('/teams');
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'team1');

    cy.get(':nth-child(2) > .flex-row > :nth-child(2) > [title="Delete team"]').should('not.exist');
  });
});
