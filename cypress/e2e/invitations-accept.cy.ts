import { invitationTokenLocalStorageKey } from '../../src/app/types/invitation';
import { userMigWithoutPreferences } from '../fixtures/user';
import { createInvitation } from '../fixtures/invitations';

describe('Test token storage and retrieval', () => {
  beforeEach(() => {
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
  });
  beforeEach(() => {
    cy.setPermission();
  });

  it('should store token in local storage', () => {
    cy.visit('/invitations/e303b166-5d66-4151-8f5f-b84ba84a7559?token=93c05fe3-b20f-48cf-aea6-39eb2350d640');
    cy.getAllLocalStorage().then((result) => {
      const expected = {
        'http://localhost:4200': {
          hideFirstTimeLoginDialog: 'true',
          [invitationTokenLocalStorageKey]: '93c05fe3-b20f-48cf-aea6-39eb2350d640',
        },
      };
      console.debug('expected', expected);
      console.debug('result', result);
      expect(result).to.deep.eq(expected);
    });
  });

  it('should retrieve token from local storage after redirect', () => {
    cy.setupAuth();
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      statusCode: 403,
    });
    cy.intercept('POST', '/appuio-api/apis/user.appuio.io/v1/invitationredeemrequests', (req) => {
      req.reply(req.body);
    });
    window.localStorage.setItem(invitationTokenLocalStorageKey, '93c05fe3-b20f-48cf-aea6-39eb2350d640');

    cy.visit('/invitations/e303b166-5d66-4151-8f5f-b84ba84a7559');
    cy.get('#processing-message').should('contain.text', 'Invitation is being processed in the background.');
    cy.getAllLocalStorage().then((result) => {
      const expected = {
        'http://localhost:4200': {
          hideFirstTimeLoginDialog: 'true',
        },
      };
      console.debug('expected', expected);
      console.debug('result', result);
      expect(result).to.deep.eq(expected);
    });
  });

  it('should retrieve token from query if already logged in', () => {
    cy.setupAuth();
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });
    cy.intercept('POST', '/appuio-api/apis/user.appuio.io/v1/invitationredeemrequests', (req) => {
      req.reply(req.body);
    });

    cy.visit('/invitations/e303b166-5d66-4151-8f5f-b84ba84a7559?token=93c05fe3-b20f-48cf-aea6-39eb2350d640');
    cy.get('#processing-message').should('contain.text', 'Invitation is being processed in the background.');
    cy.url().should('equal', 'http://localhost:4200/invitations/e303b166-5d66-4151-8f5f-b84ba84a7559');
  });
});

describe('Test invitation accept', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
    cy.setPermission();
  });

  it('should display success message', () => {
    cy.setupAuth();
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });
    cy.intercept('POST', '/appuio-api/apis/user.appuio.io/v1/invitationredeemrequests', (req) => {
      req.reply(req.body);
    }).as('createInvitationRedeemRequest');
    cy.intercept('GET', '/appuio-api/apis/user.appuio.io/v1/invitations/e303b166-5d66-4151-8f5f-b84ba84a7559', {
      body: createInvitation({
        hasStatus: true,
        redeemed: 'redeemed',
        organizations: [{ name: 'nxt', condition: 'True' }],
      }),
    }).as('getInvitation');

    cy.visit('/invitations/e303b166-5d66-4151-8f5f-b84ba84a7559?token=93c05fe3-b20f-48cf-aea6-39eb2350d640');
    cy.get('#processing-message').should('contain.text', 'Invitation is being processed in the background.');
    cy.wait('@createInvitationRedeemRequest');
    cy.wait('@getInvitation');
    cy.get('p-toast').should('contain.text', 'Redeem successful');
    cy.get('.p-button-success').should('contain.text', 'Reload');
  });

  it('should display success message if some targets failed', () => {
    cy.setupAuth();
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });
    cy.intercept('POST', '/appuio-api/apis/user.appuio.io/v1/invitationredeemrequests', (req) => {
      req.reply(req.body);
    }).as('createInvitationRedeemRequest');
    cy.intercept('GET', '/appuio-api/apis/user.appuio.io/v1/invitations/e303b166-5d66-4151-8f5f-b84ba84a7559', {
      body: createInvitation({
        hasStatus: true,
        redeemed: 'redeemed',
        organizations: [{ name: 'nxt', condition: 'False' }],
      }),
    }).as('getInvitation');

    cy.visit('/invitations/e303b166-5d66-4151-8f5f-b84ba84a7559?token=93c05fe3-b20f-48cf-aea6-39eb2350d640');
    cy.get('#processing-message').should('contain.text', 'Invitation is being processed in the background.');
    cy.wait('@createInvitationRedeemRequest');
    cy.wait('@getInvitation');
    cy.get('p-toast').should('contain.text', 'not all permissions could be granted');
    cy.get('.p-button-success').should('contain.text', 'Reload');
  });

  it('should display success message after polling', () => {
    cy.setupAuth();
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });
    cy.intercept('POST', '/appuio-api/apis/user.appuio.io/v1/invitationredeemrequests', (req) => {
      req.reply(req.body);
    }).as('createInvitationRedeemRequest');

    let interceptCount = 0;
    cy.intercept(
      'GET',
      '/appuio-api/apis/user.appuio.io/v1/invitations/e303b166-5d66-4151-8f5f-b84ba84a7559',
      (req) => {
        console.log('count', interceptCount);
        if (interceptCount === 0) {
          interceptCount++;
          req.reply({ statusCode: 403 });
        } else if (interceptCount === 1) {
          interceptCount++;
          req.reply(
            createInvitation({
              hasStatus: true,
              redeemed: 'redeemed',
              organizations: [{ name: 'nxt', condition: 'Unknown' }],
            })
          );
        } else if (interceptCount >= 2) {
          req.reply(
            createInvitation({
              hasStatus: true,
              redeemed: 'redeemed',
              organizations: [{ name: 'nxt', condition: 'True' }],
            })
          );
        }
      }
    ).as('getInvitation');

    cy.visit('/invitations/e303b166-5d66-4151-8f5f-b84ba84a7559?token=93c05fe3-b20f-48cf-aea6-39eb2350d640');
    cy.get('#processing-message').should('contain.text', 'Invitation is being processed in the background.');
    cy.wait('@createInvitationRedeemRequest');
    cy.get('p-toast', { timeout: 10000 }).should('contain.text', 'Redeem successful');
  });

  it('should display error message if redeem failed', () => {
    cy.setupAuth();
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });
    cy.intercept('POST', '/appuio-api/apis/user.appuio.io/v1/invitationredeemrequests', {
      statusCode: 403,
      body: {
        kind: 'Status',
        status: 'Failure',
        reason: 'Forbidden',
        code: 403,
      },
    }).as('createRequest');

    cy.visit('/invitations/e303b166-5d66-4151-8f5f-b84ba84a7559?token=93c05fe3-b20f-48cf-aea6-39eb2350d640');
    cy.get('#processing-message').should('contain.text', 'Invitation is being processed in the background.');
    cy.wait('@createRequest');
    cy.get('p-toast').should('contain.text', 'Redeem failed');
  });
});
