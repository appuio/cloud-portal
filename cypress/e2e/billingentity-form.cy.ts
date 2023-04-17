import { createUser } from '../fixtures/user';
import { BillingEntity, BillingEntityPermissions, BillingEntitySpec } from '../../src/app/types/billing-entity';
import { billingEntityNxt, setBillingEntities } from '../fixtures/billingentities';

describe('Test billing entity form elements', () => {
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
    cy.setPermission({ verb: 'list', ...BillingEntityPermissions }, { verb: 'create', ...BillingEntityPermissions });
  });

  it('mark all fields required', () => {
    cy.visit('/billingentities/$new?edit=y');
    cy.get('#title').should('contain.text', 'New Billing');
    cy.get('button[type="submit"]').should('be.disabled');

    cy.get('#displayName')
      .type('a')
      .should('have.class', 'ng-invalid')
      .type('b')
      .should('not.have.class', 'ng-invalid');

    cy.get('#companyEmail').find('input').type('a{enter}');
    cy.get('#companyEmail').should('have.class', 'ng-invalid');
    cy.get('#companyEmail').find('input').type('{backspace}info@company,');
    cy.get('#companyEmail').should('not.have.class', 'ng-invalid');

    cy.get('#phone')
      .type('1{backspace}')
      .should('have.class', 'ng-invalid')
      .type('1234')
      .should('not.have.class', 'ng-invalid');

    cy.get('#line1')
      .type('1{backspace}')
      .should('have.class', 'ng-invalid')
      .type('line1')
      .should('not.have.class', 'ng-invalid');

    cy.get('#line2').type('2{backspace}').should('not.have.class', 'ng-invalid').type('line2'); // not required

    cy.get('#postal')
      .type('p{backspace}')
      .should('have.class', 'ng-invalid')
      .type('postal')
      .should('not.have.class', 'ng-invalid');

    cy.get('#city')
      .type('c{backspace}')
      .should('have.class', 'ng-invalid')
      .type('city')
      .should('not.have.class', 'ng-invalid');

    cy.get('#accountingName')
      .type('a{backspace}')
      .should('have.class', 'ng-invalid')
      .type('accounting')
      .should('not.have.class', 'ng-invalid');

    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('p-dropdown').click().contains('Switzerland').click();
    cy.get('button[type="submit"]').should('be.enabled');
  });

  it('should validate emails', () => {
    cy.visit('/billingentities/$new?edit=y');
    cy.get('#title').should('contain.text', 'New Billing');

    cy.get('.p-checkbox-box').click();

    ['#companyEmail', '#accountingEmail'].forEach((e) => {
      cy.get(e).find('input').type('a{enter}');
      cy.get(e).should('have.class', 'ng-invalid');
      cy.get(e).find('input').type('{backspace}info@company,');
      cy.get(e).should('not.have.class', 'ng-invalid');
      cy.get(e).find('input').type('b{enter}');
      cy.get(e).should('have.class', 'ng-invalid');
      cy.get(e).find('input').type('{backspace}another@tld,');
      cy.get(e).should('not.have.class', 'ng-invalid');
    });
  });

  it('should copy emails from company', () => {
    cy.visit('/billingentities/$new?edit=y');
    cy.get('#title').should('contain.text', 'New Billing');

    cy.get('#companyEmail').find('input').type('info@company,');
    cy.get('#accountingEmail').find('ul').should('have.class', 'p-disabled').should('contain.text', 'info@company');

    cy.get('#companyEmail').find('input').type('hello@company{enter}');
    cy.get('#accountingEmail')
      .find('ul')
      .should('contain.text', 'info@company')
      .should('contain.text', 'hello@company');

    cy.get('.p-checkbox-box').click();

    cy.get('#companyEmail').find('input').type('{backspace}');
    cy.get('#companyEmail').should('not.contain.text', 'hello@company');
    cy.get('#accountingEmail')
      .find('ul')
      .should('not.have.class', 'p-disabled')
      .should('contain.text', 'info@company')
      .should('contain.text', 'hello@company');

    cy.get('#accountingEmail').find('input').type('{backspace}{backspace}');
    cy.get('#accountingEmail').should('have.class', 'ng-invalid');
    cy.get('#accountingEmail').find('input').type('accounting@company,');
    cy.get('#accountingEmail').should('not.have.class', 'ng-invalid');

    cy.get('.p-checkbox-box').click();

    cy.get('#accountingEmail')
      .find('ul')
      .should('have.class', 'p-disabled')
      .should('contain.text', 'info@company')
      .should('not.contain.text', 'hello@company')
      .should('not.contain.text', 'accounting@company');
  });

  it('should cancel editing', () => {
    setBillingEntities(cy);

    ['.p-button-secondary', 'a[appbacklink]'].forEach((cancelSelector) => {
      cy.visit('/billingentities/$new?edit=y');
      cy.get('#title').should('contain.text', 'New Billing');

      cy.get(cancelSelector).click();
      cy.get('app-billingentity-form').should('not.exist');

      cy.get('p-messages').should('contain.text', 'No billing entities available');
    });
  });
});

describe('Test billing entity create', () => {
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
    cy.setPermission({ verb: 'list', ...BillingEntityPermissions }, { verb: 'create', ...BillingEntityPermissions });
  });

  it('should submit form values', () => {
    cy.intercept('POST', '/appuio-api/apis/billing.appuio.io/v1/billingentities', {
      body: billingEntityNxt,
    }).as('createBillingEntity');

    cy.visit('/billingentities/$new?edit=y');
    cy.get('#title').should('contain.text', 'New Billing');

    cy.get('#displayName').type('➡️ Engineering GmbH');

    cy.get('#companyEmail').find('input').type('hallo@nxt.engineering,');
    cy.get('#phone').type('☎️');
    cy.get('#line1').type('📃');
    cy.get('#line2').type('📋');
    cy.get('#postal').type('🏤');
    cy.get('#city').type('🏙️');
    cy.get('p-dropdown').click().contains('Switzerland').click();

    cy.get('#accountingName').type('mig');

    cy.get('button[type="submit"]').should('be.enabled').click();
    cy.wait('@createBillingEntity')
      .its('request.body')
      .then((body: BillingEntity) => {
        expect(body.metadata.generateName).eq('be-');
        expect(body.metadata.name).empty; // ensure no metadata name is set for new objects
        const expected: BillingEntitySpec = {
          name: '➡️ Engineering GmbH',
          phone: '☎️',
          emails: ['hallo@nxt.engineering'],
          address: {
            line1: '📃',
            line2: '📋',
            postalCode: '🏤',
            city: '🏙️',
            country: 'Switzerland',
          },
          accountingContact: {
            name: 'mig',
            emails: ['hallo@nxt.engineering'],
          },
        };
        console.debug('expected', expected);
        console.debug('actual', body.spec);
        expect(body.spec).deep.eq(expected);
      });

    cy.get('p-toast').should('contain.text', 'Successfully saved');
    cy.get('#title').should('contain.text', 'be-2345');
    cy.url().should('include', '/billingentities/be-2345');
  });
});
