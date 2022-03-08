describe('Test teams list', () => {
  before(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
  });
  it('list with two entries', () => {
    cy.setPermission({ verb: 'list', resource: 'teams', group: 'appuio.io' });
    cy.visit('/teams');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organizations.json',
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      fixture: 'teams.json',
    });
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'team1');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'team2');
  });

  it('empty list', () => {
    cy.setPermission({ verb: 'list', resource: 'teams', group: 'appuio.io' });
    cy.visit('/teams');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organizations.json',
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      fixture: 'teams-empty.json',
    });
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get('#no-teams-message').should('contain.text', 'No teams available.');
  });

  it('request failed', () => {
    cy.setPermission({ verb: 'list', resource: 'teams', group: 'appuio.io' });
    cy.visit('/teams');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organizations.json',
    });
    cy.visit('/teams');
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      statusCode: 403,
    });
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get('#teams-failure-message').should('contain.text', 'Teams could not be loaded.');
  });
  it('no permission', () => {
    cy.visit('/teams');
    cy.get('h1').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
  });
});

describe('Test team edit', () => {
  before(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
  });
  it('edit team with button', () => {
    cy.setPermission(
      { verb: 'list', resource: 'teams', group: 'appuio.io' },
      { verb: 'update', resource: 'teams', group: 'appuio.io' }
    );
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organizations.json',
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

    cy.get(':nth-child(2) > :nth-child(3) > .p-ripple').click();
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
    cy.setPermission({ verb: 'list', resource: 'teams', group: 'appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organizations.json',
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
  before(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
  });
  it('add team with button', () => {
    cy.setPermission(
      { verb: 'list', resource: 'teams', group: 'appuio.io' },
      { verb: 'create', resource: 'teams', group: 'appuio.io' },
      { verb: 'update', resource: 'teams', group: 'appuio.io' }
    );
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organizations.json',
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
    cy.setPermission(
      { verb: 'list', resource: 'teams', group: 'appuio.io' },
      { verb: 'update', resource: 'teams', group: 'appuio.io' }
    );
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organizations.json',
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
  before(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
  });
  it('delete team with button', () => {
    cy.setPermission(
      { verb: 'list', resource: 'teams', group: 'appuio.io' },
      { verb: 'delete', resource: 'teams', group: 'appuio.io' }
    );
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organizations.json',
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
      "Are you sure that you want to delete the team 'My Super Team 1'?"
    );
    cy.get('.p-confirm-dialog-accept').click();
    cy.wait('@delete');
  });
  it('no delete permission', () => {
    cy.setPermission({ verb: 'list', resource: 'teams', group: 'appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organizations.json',
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      fixture: 'teams.json',
    });
    cy.visit('/teams');
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > :nth-child(2) > [title="Delete team"]').should('not.exist');
  });
});
