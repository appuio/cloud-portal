import { createUser } from '../fixtures/user';
import { InvitationPermissions } from '../../src/app/types/invitation';
import { createInvitation } from '../fixtures/invitations';
import { organizationVshn } from '../fixtures/organization';
import { createTeam } from '../fixtures/team';

describe('Test invitation list', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig' }),
    });
    cy.setPermission({ verb: 'list', ...InvitationPermissions });
  });

  it('list with two entries', () => {
    cy.intercept('GET', 'appuio-api/apis/user.appuio.io/v1/invitations', {
      body: {
        items: [
          createInvitation({ organizations: [{ name: 'nxt-dev', role: 'admin', teams: ['devs'] }] }),
          createInvitation({ organizations: [{ name: 'nxt-dev' }] }),
        ],
      },
    });
    cy.visit('/invitations');
    cy.get('#title').should('contain.text', 'Invitations');
    cy.get('.flex-row > .text-3xl').eq(0).should('contain.text', 'dev@nxt.engineering');
    cy.get('.flex-row > .text-3xl').eq(1).should('contain.text', 'dev@nxt.engineering');
  });

  it('empty list', () => {
    cy.intercept('GET', 'appuio-api/apis/user.appuio.io/v1/invitations', {
      body: {
        items: [],
      },
    });
    cy.visit('/invitations');
    cy.get('#title').should('contain.text', 'Invitations');
    cy.get('#emptylist').should('contain.text', 'No invitations available.');
  });

  it('request failed', () => {
    cy.intercept('GET', 'appuio-api/apis/user.appuio.io/v1/invitations', {
      statusCode: 403,
    });
    cy.visit('/invitations');
    cy.get('#title').should('contain.text', 'Invitations');
    cy.get('#failure-message').should('contain.text', 'Invitations could not be loaded.');
  });

  it('failed requests are retried', () => {
    let interceptCount = 0;
    cy.intercept('GET', 'appuio-api/apis/user.appuio.io/v1/invitations', (req) => {
      if (interceptCount === 0) {
        interceptCount++;
        req.reply({ statusCode: 503 });
      } else {
        req.reply({
          items: [createInvitation({ organizations: [{ name: 'nxt-dev' }] })],
        });
      }
    });
    cy.visit('/invitations');

    cy.get('#title').should('contain.text', 'Invitations');
    cy.get('.flex-row > .text-3xl').should('contain.text', 'dev@nxt.engineering');
  });
});

describe('no permissions', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
  });

  it('no list permission', () => {
    cy.intercept('POST', 'appuio-api/apis/authorization.k8s.io/v1/selfsubjectaccessreviews', {
      body: { spec: { resourceAttributes: { resource: '', group: '', verb: '' } }, status: { allowed: false } },
    });
    cy.visit('/invitations');
    cy.get('h1').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
  });
});

describe('invitation details', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
    cy.setPermission({ verb: 'list', ...InvitationPermissions });
  });

  it('displays single properties', () => {
    cy.intercept('GET', 'appuio-api/apis/user.appuio.io/v1/invitations', {
      body: {
        items: [createInvitation({ email: 'sent' })],
      },
    });
    cy.visit('/invitations');

    cy.get('#title').should('contain.text', 'Invitations');
    cy.get('.flex-row > .text-3xl').should('contain.text', 'dev@nxt.engineering');
    cy.get('li div.text-900').eq(0).should('contain.text', 'e303b166-5d66-4151-8f5f-b84ba84a7559');
    cy.get('li div.text-900').eq(1).should('contain.text', 'New Employee working for ');
    cy.get('li div.text-900')
      .eq(3)
      .should('contain.text', 'Pending')
      .should('contain.text', 'EmailSent')
      .find('span')
      .should('have.class', 'p-tag-info')
      .should('have.class', 'p-tag-success');
    cy.get('p-table').should('not.exist');
  });

  it('displays failed condition', () => {
    cy.intercept('GET', 'appuio-api/apis/user.appuio.io/v1/invitations', {
      body: {
        items: [createInvitation({ email: 'sendFailed' })],
      },
    });
    cy.visit('/invitations');

    cy.get('li div.text-900')
      .eq(3)
      .should('contain.text', 'The email could not be sent')
      .find('span')
      .should('have.class', 'p-tag-danger');
  });

  it('displays advanced properties with display names and fallback values', () => {
    cy.intercept('GET', 'appuio-api/apis/user.appuio.io/v1/invitations', {
      body: {
        items: [
          createInvitation({
            redeemed: 'redeemed',
            organizations: [
              { name: 'nxt', role: 'both' },
              { name: 'vshn', role: 'viewer', teams: ['dev-team', 'ops-team'] },
            ],
            billingEntities: [{ name: 'be-2345', role: 'both' }],
          }),
        ],
      },
    });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations/vshn', {
      body: organizationVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/vshn/teams/ops-team', {
      body: createTeam({ name: 'ops-team', namespace: 'vshn', displayName: 'My Super Team', userRefs: [] }),
    });

    cy.visit('/invitations');

    cy.get('li div.text-900')
      .eq(3)
      .should('contain.text', 'Redeemed')
      .find('span')
      .should('have.class', 'p-tag-success');
    cy.get('p-table').should('exist');
    cy.get('td').eq(0).should('contain.text', 'nxt').find('svg').should('have.class', 'fa-sitemap');
    cy.get('td').eq(1).find('svg').should('have.class', 'fa-check');
    cy.get('td').eq(2).find('svg').should('have.class', 'fa-check');
    cy.get('td').eq(3).should('be.empty');

    cy.get('td')
      .eq(4)
      .should('contain.text', 'VSHN - the DevOps Company')
      .find('svg')
      .should('have.class', 'fa-sitemap');
    cy.get('td').eq(5).find('svg').should('have.class', 'fa-check');
    cy.get('td').eq(6).should('be.empty');
    cy.get('td').eq(7).should('contain.text', 'dev-team').should('contain.text', 'My Super Team');

    cy.get('td').eq(8).should('contain.text', 'be-2345').find('svg').should('have.class', 'fa-dollar-sign');
    cy.get('td').eq(9).find('svg').should('have.class', 'fa-check');
    cy.get('td').eq(10).find('svg').should('have.class', 'fa-check');
    cy.get('td').eq(11).should('be.empty');
  });
});
