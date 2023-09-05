import { createUser } from '../fixtures/user';
import { BillingEntity, BillingEntityPermissions, BillingEntitySpec } from '../../src/app/types/billing-entity';
import { billingEntityNxt, setBillingEntities } from '../fixtures/billingentities';
import { OrganizationPermissions } from '../../src/app/types/organization';

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

  it('should prefill existing values', () => {
    cy.intercept('GET', '/appuio-api/apis/billing.appuio.io/v1/billingentities/be-2345', {
      body: billingEntityNxt,
    });

    cy.visit('/billingentities/be-2345?edit=y');

    cy.get('#displayName').should('have.value', '➡️ Engineering GmbH');
    cy.get('#companyEmail').should('contain.text', 'hallo@nxt.engineering');
    cy.get('#phone').should('have.value', '☎️');
    cy.get('#line1').should('have.value', '📃');
    cy.get('#line2').should('have.value', '📋');
    cy.get('#postal').should('have.value', '🏤');
    cy.get('#city').should('have.value', '🏙️');
    cy.get('p-dropdown').should('contain.text', 'Switzerland');
    cy.get('#accountingName').should('have.value', 'mig');
    cy.get('#accountingEmail').should('contain.text', 'hallo@nxt.engineering');

    cy.get('#companyEmail').find('input').type('{backspace}info@nxt.engineering{enter}');
    cy.get('#accountingEmail')
      .should('contain.text', 'info@nxt.engineering')
      .should('not.contain.text', 'accounting@nxt.engineering');
    cy.get('.p-checkbox').should('have.class', 'p-checkbox-checked').click();
    cy.get('#accountingEmail')
      .should('not.contain.text', 'info@nxt.engineering')
      .should('contain.text', 'hallo@nxt.engineering');
    cy.get('#accountingEmail').find('input').type('{backspace}accounting@nxt.engineering{enter}');

    cy.get('.p-checkbox').click();
    cy.get('#accountingEmail')
      .should('not.contain.text', 'accounting@nxt.engineering')
      .should('contain.text', 'info@nxt.engineering');
    cy.get('button[type="submit"]').should('be.enabled');
  });

  it('should cancel editing', () => {
    setBillingEntities(cy, billingEntityNxt); // give at least 1 item to avoid redirect back to form.

    ['.p-button-secondary', 'a[appbacklink]'].forEach((cancelSelector) => {
      cy.visit('/billingentities/$new?edit=y');
      cy.get('#title').should('contain.text', 'New Billing');

      cy.get(cancelSelector).click();
      cy.get('app-billingentity-form').should('not.exist');

      cy.get('.text-3xl').should('have.length', 1);
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
    cy.setPermission(
      { verb: 'list', ...BillingEntityPermissions },
      { verb: 'create', ...BillingEntityPermissions },
      { verb: 'list', ...OrganizationPermissions }
    );
  });

  it('should create billing', () => {
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
    cy.url().should('include', '/billingentities/be-2345').should('not.include', '?edit=y');
    cy.get('.flex-wrap > .text-900').eq(0).should('contain.text', '➡️ Engineering GmbH');

    cy.get('#title').should('contain.text', '➡️ Engineering GmbH');
    cy.get('.flex-wrap > .text-900').eq(1).should('contain.text', 'be-2345');
    cy.get('.flex-wrap > .text-900').eq(2).should('contain.text', 'hallo@nxt.engineering');
    cy.get('.flex-wrap > .text-900').eq(3).should('contain.text', '☎️');
    cy.get('.flex-wrap > .text-900').eq(4).should('contain.text', '📃📋🏤 🏙️Switzerland');
    cy.get('.flex-wrap > .text-900').eq(5).should('contain.text', 'mig hallo@nxt.engineering');
    cy.get('.flex-wrap > .text-900').eq(6).should('contain.text', '🇩🇪');
  });

  it('should forward to organizations if first time', () => {
    cy.intercept('POST', '/appuio-api/apis/billing.appuio.io/v1/billingentities', (req) => {
      const be: BillingEntity = req.body;
      be.metadata.name = 'be-2345';
      be.metadata.generateName = '';
      req.reply(be);
    }).as('createBillingEntity');
    setBillingEntities(cy, billingEntityNxt);

    cy.visit('/billingentities/$new?edit=y&firstTime=y');
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
    cy.wait('@createBillingEntity');

    cy.get('p-toast').should('contain.text', 'Successfully saved');
    cy.url().should('include', '/organizations/$new').should('not.include', '?edit=y');

    cy.get('#title').should('contain.text', 'New Organization');
  });
});

describe('Test billing entity edit', () => {
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
    cy.setPermission(
      { verb: 'list', ...BillingEntityPermissions },
      { verb: 'create', ...BillingEntityPermissions },
      { verb: 'update', ...BillingEntityPermissions, name: 'be-2345' }
    );
  });

  it('should update billing', () => {
    cy.intercept('GET', '/appuio-api/apis/billing.appuio.io/v1/billingentities/be-2345', {
      body: billingEntityNxt,
    });

    cy.intercept('PATCH', '/appuio-api/apis/billing.appuio.io/v1/billingentities/be-2345', (req) => {
      req.reply(req.body);
    }).as('updateBillingEntity');

    cy.visit('/billingentities/be-2345');
    cy.get('#title').should('contain.text', '➡️ Engineering GmbH');

    cy.get('svg[class*="fa-pen-to-square"]').click();

    cy.get('#displayName').should('have.value', '➡️ Engineering GmbH');

    cy.get('#displayName').type('{selectAll}nxt Engineering');
    cy.get('#companyEmail').type('info@nxt.engineering{enter}');
    cy.get('#phone').type('{selectAll}1234');
    cy.get('#line1').type('{selectAll}line1');
    cy.get('#line2').type('{selectAll}{backspace}').should('have.value', '');
    cy.get('#postal').type('{selectAll}4321');
    cy.get('#city').type('{selectAll}Berlin');
    cy.get('p-dropdown').click().contains('Germany').click();

    cy.get('#accountingName').type('{selectAll}{backspace}crc');
    cy.get('.p-checkbox').click();

    cy.get('button[type="submit"]').should('be.enabled').click();
    cy.wait('@updateBillingEntity')
      .its('request.body')
      .then((body: BillingEntity) => {
        expect(body.metadata.name).eq('be-2345');
        const expected: BillingEntitySpec = {
          name: 'nxt Engineering',
          phone: '1234',
          emails: ['hallo@nxt.engineering', 'info@nxt.engineering'],
          address: {
            line1: 'line1',
            line2: '',
            postalCode: '4321',
            city: 'Berlin',
            country: 'Germany',
          },
          accountingContact: {
            name: 'crc',
            emails: ['hallo@nxt.engineering'],
          },
          // even we don't use this field yet, ensure it gets sent back.
          languagePreference: '🇩🇪',
        };
        console.debug('expected', expected);
        console.debug('actual', body.spec);
        expect(body.spec).deep.eq(expected);
      });

    cy.get('p-toast').should('contain.text', 'Successfully saved');
    cy.url().should('include', '/billingentities/be-2345').should('not.include', '?edit=y');
    // check values
    cy.get('#title').should('contain.text', 'nxt Engineering');
    cy.get('.flex-wrap > .text-900').eq(0).should('contain.text', 'nxt Engineering');
    cy.get('.flex-wrap > .text-900').eq(1).should('contain.text', 'be-2345');
    cy.get('.flex-wrap > .text-900')
      .eq(2)
      .should('contain.text', 'hallo@nxt.engineering')
      .should('contain.text', 'info@nxt.engineering');
    cy.get('.flex-wrap > .text-900').eq(3).should('contain.text', '1234');
    cy.get('.flex-wrap > .text-900')
      .eq(4)
      .should('contain.text', 'line1')
      .should('contain.text', '4321 Berlin')
      .should('contain.text', 'Germany');
    cy.get('.flex-wrap > .text-900').eq(5).should('contain.text', 'crc hallo@nxt.engineering');
    cy.get('.flex-wrap > .text-900').eq(6).should('contain.text', '🇩🇪');
  });
});
