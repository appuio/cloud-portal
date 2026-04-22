import { invitationTokenLocalStorageKey } from '../../src/app/types/invitation';
import { userMigWithoutPreferences } from '../fixtures/user';
import { createInvitation } from '../fixtures/invitations';
import { organizationNxt, organizationVshn, setOrganization } from '../fixtures/organization';
import { OrganizationPermissions } from '../../src/app/types/organization';

// noinspection SpellCheckingInspection -- test fixture UUIDs
const INVITATION_URL = '/invitations/e303b166-5d66-4151-8f5f-b84ba84a7559'; // gitleaks:allow
const INVITATION_URL_WITH_TOKEN = `${INVITATION_URL}?token=93c05fe3-b20f-48cf-aea6-39eb2350d640`; // gitleaks:allow
const INVITATION_API = '/appuio-api/apis/user.appuio.io/v1/invitations/e303b166-5d66-4151-8f5f-b84ba84a7559';
const REDEEM_API = '/appuio-api/apis/user.appuio.io/v1/invitationredeemrequests';

describe('Test token storage and retrieval', () => {
  beforeEach(() => {
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
  });
  beforeEach(() => {
    cy.setPermission();
  });

  it('should store token in local storage', () => {
    cy.intercept('GET', INVITATION_API, { statusCode: 403 });
    cy.visit(INVITATION_URL_WITH_TOKEN);
    cy.window()
      .its('localStorage')
      .invoke('getItem', invitationTokenLocalStorageKey)
      .should('eq', '93c05fe3-b20f-48cf-aea6-39eb2350d640'); // gitleaks:allow
  });

  it('should retrieve token from local storage after redirect', () => {
    cy.setupAuth();
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', { statusCode: 403 });
    cy.intercept('GET', INVITATION_API, { statusCode: 403 });
    cy.intercept('POST', REDEEM_API, (req) => {
      req.reply(req.body);
    });
    window.localStorage.setItem(invitationTokenLocalStorageKey, '93c05fe3-b20f-48cf-aea6-39eb2350d640'); // gitleaks:allow

    cy.visit(INVITATION_URL);
    cy.get('[data-cy="invitation-loading"]').should('contain.text', 'Loading');
    cy.window()
      .its('localStorage')
      .invoke('getItem', invitationTokenLocalStorageKey)
      .should('be.null');
  });
});

describe('Test invitation accept for existing user', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.setPermission({ verb: 'list', ...OrganizationPermissions });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });
  });

  it('should display message if already redeemed', () => {
    cy.intercept('GET', INVITATION_API, {
      body: createInvitation({ hasStatus: true, redeemed: 'redeemed' }),
    }).as('getInvitation');

    cy.visit(INVITATION_URL_WITH_TOKEN);
    cy.wait('@getInvitation');
    cy.get('#redeemed-message').should('contain.text', 'Invitation is already redeemed.');
  });

  it('should display success message', () => {
    cy.intercept('POST', REDEEM_API, (req) => {
      req.reply(req.body);
    }).as('createInvitationRedeemRequest');

    let interceptCount = 0;
    cy.intercept('GET', INVITATION_API, (req) => {
      if (interceptCount === 0) {
        interceptCount++;
        req.reply(
          createInvitation({
            hasStatus: true,
            redeemed: 'pending',
            organizations: [{ name: 'nxt', condition: 'Unknown' }],
          })
        );
      } else {
        req.reply(
          createInvitation({
            hasStatus: true,
            redeemed: 'redeemed',
            organizations: [{ name: 'nxt', condition: 'True' }],
          })
        );
      }
    }).as('getInvitation');

    cy.visit(INVITATION_URL_WITH_TOKEN);
    cy.wait('@createInvitationRedeemRequest');
    cy.get('#title').should('contain.text', 'Invitation');
    cy.get('[data-cy="invitation-email"]', { timeout: 7000 }).should('contain.text', 'dev@nxt.engineering');
    cy.get('p-toast').should('contain.text', 'Invitation accepted');
  });

  it('should accept but display message if some targets failed', () => {
    cy.intercept('POST', REDEEM_API, (req) => {
      req.reply(req.body);
    }).as('createInvitationRedeemRequest');

    let interceptCount = 0;
    cy.intercept('GET', INVITATION_API, (req) => {
      if (interceptCount === 0) {
        interceptCount++;
        req.reply(
          createInvitation({
            hasStatus: true,
            redeemed: 'pending',
            organizations: [{ name: 'nxt', condition: 'Unknown' }],
          })
        );
      } else {
        req.reply(
          createInvitation({
            hasStatus: true,
            redeemed: 'redeemed',
            organizations: [{ name: 'nxt', condition: 'False' }],
          })
        );
      }
    }).as('getInvitation');

    cy.visit(INVITATION_URL_WITH_TOKEN);
    cy.wait('@createInvitationRedeemRequest');
    cy.wait('@getInvitation');
    cy.get('p-toast').should('contain.text', 'not all permissions could be granted');
    cy.get('[data-cy="invitation-email"]').should('contain.text', 'dev@nxt.engineering');
  });

  it('should display error message if redeem failed', () => {
    cy.intercept('GET', INVITATION_API, {
      body: createInvitation({
        hasStatus: true,
        organizations: [{ name: 'nxt' }],
      }),
    });
    cy.intercept('POST', REDEEM_API, {
      statusCode: 403,
      body: {
        kind: 'Status',
        status: 'Failure',
        reason: 'Forbidden',
        code: 403,
      },
    }).as('createRequest');

    cy.visit(INVITATION_URL_WITH_TOKEN);
    cy.wait('@createRequest');
    cy.get('[data-cy="invitation-email"]').should('contain.text', 'dev@nxt.engineering');
    cy.get('p-toast')
      .should('contain.text', 'Redeem failed')
      .and('contain.text', 'Not allowed, most likely already redeemed');
  });

  it('should reload entities after redeeming', () => {
    cy.intercept('POST', REDEEM_API, (req) => {
      req.reply(req.body);
    }).as('createInvitationRedeemRequest');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations/nxt', {
      statusCode: 401, // this is invoked to resolve display name for organization, but at this point we don't have yet access.
    });

    let organizationInterceptCount = 0;
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', (req) => {
      if (organizationInterceptCount === 0) {
        organizationInterceptCount++;
        req.reply({ items: [organizationVshn] });
      } else {
        req.reply({ items: [organizationVshn, organizationNxt] });
      }
    }).as('organizationList');

    let invitationInterceptCount = 0;
    cy.intercept('GET', INVITATION_API, (req) => {
      if (invitationInterceptCount === 0) {
        invitationInterceptCount++;
        req.reply(
          createInvitation({
            hasStatus: true,
            redeemed: 'pending',
            organizations: [{ name: 'nxt', condition: 'Unknown' }],
          })
        );
      } else {
        req.reply(
          createInvitation({
            hasStatus: true,
            redeemed: 'redeemed',
            organizations: [{ name: 'nxt', condition: 'True' }],
          })
        );
      }
    }).as('getInvitation');

    cy.visit('/organizations');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'VSHN - the DevOps Company');

    cy.visit(INVITATION_URL_WITH_TOKEN);
    cy.wait('@createInvitationRedeemRequest');
    cy.wait('@getInvitation');
    cy.get('#title').should('contain.text', 'Invitation');
    cy.get('[data-cy="invitation-email"]').should('contain.text', 'dev@nxt.engineering');
    cy.get('p-toast').should('contain.text', 'Invitation accepted');

    cy.get('app-navbar-item').contains('Organizations').click();
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'VSHN - the DevOps Company');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'nxt Engineering GmbH');
  });

  it('should display message even if navigated away', () => {
    cy.intercept('POST', REDEEM_API, (req) => {
      req.reply(req.body);
    }).as('createInvitationRedeemRequest');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations/nxt', {
      statusCode: 403,
    });

    setOrganization(cy, organizationNxt);

    let invitationInterceptCount = -1;
    cy.intercept('GET', INVITATION_API, (req) => {
      invitationInterceptCount++;
      if (invitationInterceptCount <= 1) {
        req.reply(
          createInvitation({
            hasStatus: true,
            redeemed: 'pending',
            organizations: [{ name: 'nxt', condition: 'Unknown' }],
          })
        );
      } else {
        req.reply(
          createInvitation({
            hasStatus: true,
            redeemed: 'redeemed',
            organizations: [{ name: 'nxt', condition: 'True' }],
          })
        );
      }
    }).as('getInvitation');

    cy.visit(INVITATION_URL_WITH_TOKEN);
    cy.wait('@createInvitationRedeemRequest');

    cy.get('#title').should('contain.text', 'Invitation');

    cy.get('app-navbar-item').contains('Organizations').click();
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'nxt Engineering GmbH');
    cy.get('p-toast', { timeout: 10000 }).should('contain.text', 'Invitation accepted');
  });
});

describe('Test invitation accept for new user', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'false');
    cy.setPermission();
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      statusCode: 404,
    });
  });

  it('should display success message', () => {
    cy.intercept('POST', REDEEM_API, (req) => {
      req.reply(req.body);
    }).as('createInvitationRedeemRequest');

    let interceptCount = 0;
    cy.intercept('GET', INVITATION_API, (req) => {
      if (interceptCount === 0) {
        interceptCount++;
        req.reply(403);
      } else {
        req.reply(
          createInvitation({
            hasStatus: true,
            redeemed: 'redeemed',
            organizations: [{ name: 'nxt', condition: 'True' }],
          })
        );
      }
    }).as('getInvitation');

    cy.visit(INVITATION_URL_WITH_TOKEN);
    cy.wait('@createInvitationRedeemRequest');
    cy.wait('@getInvitation');
    cy.get('#title').should('contain.text', 'Invitation');
    cy.get('[data-cy="invitation-email"]', { timeout: 7000 }).should('contain.text', 'dev@nxt.engineering');
    cy.get('p-toast').should('contain.text', 'Invitation accepted');
  });

  it('should accept but display message if some targets failed', () => {
    cy.intercept('POST', REDEEM_API, (req) => {
      req.reply(req.body);
    }).as('createInvitationRedeemRequest');

    let interceptCount = 0;
    cy.intercept('GET', INVITATION_API, (req) => {
      if (interceptCount === 0) {
        interceptCount++;
        req.reply(403);
      } else {
        req.reply(
          createInvitation({
            hasStatus: true,
            redeemed: 'redeemed',
            organizations: [{ name: 'nxt', condition: 'False' }],
          })
        );
      }
    }).as('getInvitation');

    cy.visit(INVITATION_URL_WITH_TOKEN);
    cy.wait('@createInvitationRedeemRequest');
    cy.wait('@getInvitation');
    cy.get('p-toast').should('contain.text', 'not all permissions could be granted');
    cy.get('[data-cy="invitation-email"]').should('contain.text', 'dev@nxt.engineering');
  });

  it('should display error message if redeem failed', () => {
    cy.intercept('GET', INVITATION_API, { statusCode: 403 });
    cy.intercept('POST', REDEEM_API, {
      statusCode: 403,
      body: {
        kind: 'Status',
        status: 'Failure',
        reason: 'Forbidden',
        code: 403,
      },
    }).as('createRequest');

    cy.visit(INVITATION_URL_WITH_TOKEN);
    cy.wait('@createRequest');
    cy.get('#failure-message').should('contain.text', 'Invitation could not be loaded.');
    cy.get('p-toast')
      .should('contain.text', 'Redeem failed')
      .and('contain.text', 'Not allowed, most likely already redeemed');
  });
});
