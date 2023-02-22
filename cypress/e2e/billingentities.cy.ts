import { createUser } from '../fixtures/user';
import { billingEntityNxt, billingEntityVshn } from '../fixtures/billingentities';
import { BillingEntityPermissions } from '../../src/app/types/billing-entity';

describe('Test billing entity list', () => {
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

  it('list with two entries', () => {
    cy.setPermission({ verb: 'list', ...BillingEntityPermissions });
    cy.intercept('GET', 'appuio-api/apis/billing.appuio.io/v1/billingentities', {
      body: { items: [billingEntityNxt, billingEntityVshn] },
    });
    cy.visit('/billingentities');
    cy.get('#billingentities-title').should('contain.text', 'Billing');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'be-2345');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'be-2347');
  });

  it('empty list', () => {
    cy.setPermission({ verb: 'list', ...BillingEntityPermissions });
    cy.intercept('GET', 'appuio-api/apis/billing.appuio.io/v1/billingentities', {
      body: { items: [] },
    });
    cy.visit('/billingentities');
    cy.get('#billingentities-title').should('contain.text', 'Billing');
    cy.get('#no-billingentity-message').should('contain.text', 'No billing entities available.');
  });

  it('request failed', () => {
    cy.setPermission({ verb: 'list', ...BillingEntityPermissions });
    cy.intercept('GET', 'appuio-api/apis/billing.appuio.io/v1/billingentities', {
      statusCode: 403,
    });
    cy.visit('/billingentities');
    cy.get('#billingentities-title').should('contain.text', 'Billing');
    cy.get('#failure-message').should('contain.text', 'Billing entities could not be loaded.');
  });

  it('failed requests are retried', () => {
    cy.setPermission({ verb: 'list', ...BillingEntityPermissions });

    let interceptCount = 0;
    cy.intercept('GET', 'appuio-api/apis/billing.appuio.io/v1/billingentities', (req) => {
      if (interceptCount === 0) {
        interceptCount++;
        req.reply({ statusCode: 503 });
      } else {
        req.reply({ items: [billingEntityNxt, billingEntityVshn] });
      }
    });
    cy.visit('/billingentities');

    cy.get('#billingentities-title').should('contain.text', 'Billing');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'be-2345');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'be-2347');
  });

  it('no permission', () => {
    cy.visit('/billingentities');
    cy.get('h1').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
  });
});

describe('Test billing entity details', () => {
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

  it('request failed', () => {
    cy.setPermission({ verb: 'list', ...BillingEntityPermissions });
    cy.intercept('GET', 'appuio-api/apis/billing.appuio.io/v1/billingentities/be-2345', {
      statusCode: 403,
    });
    cy.visit('/billingentities/be-2345');
    cy.get('#failure-message').should('contain.text', 'Billing entity "be-2345" could not be loaded.');
  });

  it('list details', () => {
    cy.setPermission({ verb: 'list', ...BillingEntityPermissions });
    cy.intercept('GET', 'appuio-api/apis/billing.appuio.io/v1/billingentities/be-2345', {
      body: billingEntityNxt,
    });
    cy.visit('/billingentities/be-2345');
    cy.get('.flex-wrap > .text-900').eq(0).should('contain.text', 'NXT Engineering');
    cy.get('.flex-wrap > .text-900').eq(1).should('contain.text', '📧');
    cy.get('.flex-wrap > .text-900').eq(2).should('contain.text', '☎️');
    cy.get('.flex-wrap > .text-900').eq(3).should('contain.text', '📃📋🏤 🏙️🇨🇭');
    cy.get('.flex-wrap > .text-900').eq(4).should('contain.text', 'mig 📧');
    cy.get('.flex-wrap > .text-900').eq(5).should('contain.text', '🇩🇪');
  });
});
