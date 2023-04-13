import { createUser } from '../fixtures/user';
import { organizationListNxtVshn, organizationNxt, setOrganization } from '../fixtures/organization';
import { OrganizationPermissions } from '../../src/app/types/organization';
import { OrganizationMembersPermissions } from '../../src/app/types/organization-members';
import { InvitationPermissions } from '../../src/app/types/invitation';
import { BillingEntityPermissions } from '../../src/app/types/billing-entity';
import { billingEntityNxt, setBillingEntities } from '../fixtures/billingentities';
import { createInvitation } from '../fixtures/invitations';
import { createOrganizationMembers } from '../fixtures/organization-members';

describe('Test First Time Login', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.removeItem('hideFirstTimeLoginDialog');
    cy.disableCookieBanner();
  });
  beforeEach(() => {
    // we assume we don't have the user object yet.
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      statusCode: 403,
    });
  });

  it('join organization if not part of organization', () => {
    cy.setPermission(
      { verb: 'list', ...OrganizationPermissions },
      { verb: 'list', ...BillingEntityPermissions },
      { verb: 'create', ...BillingEntityPermissions }
    );
    setOrganization(cy);
    setBillingEntities(cy);
    cy.visit('/');
    cy.get('.p-dialog-header').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
    cy.get('#setDefaultOrganizationDialogButton').should('not.exist');
    cy.get('#addBillingDialogButton').should('exist');
    cy.get('#addOrganizationDialogButton').should('not.exist');
    cy.get('#joinOrganizationDialogButton').click();
    cy.get('.p-dialog-header').should('contain.text', 'Join Organization');
  });

  it('join organization if not part of organization and no billing access', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions });
    setOrganization(cy);
    cy.visit('/');
    cy.get('.p-dialog-header').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
    cy.get('#setDefaultOrganizationDialogButton').should('not.exist');
    cy.get('#addBillingDialogButton').should('not.exist');
    cy.get('#addOrganizationDialogButton').should('not.exist');
    cy.get('#joinOrganizationDialogButton').click();
    cy.get('.p-dialog-header').should('contain.text', 'Join Organization');
  });

  it('add organization if not part of organization but part of billing', () => {
    cy.setPermission(
      { verb: 'list', ...OrganizationPermissions },
      { verb: 'list', ...BillingEntityPermissions },
      { verb: 'create', ...BillingEntityPermissions }
    );
    setBillingEntities(cy, billingEntityNxt);
    setOrganization(cy);
    cy.visit('/');
    cy.get('.p-dialog-header').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
    cy.get('#joinOrganizationDialogButton').should('exist');
    cy.get('#setDefaultOrganizationDialogButton').should('not.exist');
    cy.get('#addBillingDialogButton').should('not.exist');
    cy.get('#addOrganizationDialogButton').click();
    cy.get('.text-3xl > .ng-star-inserted').should('contain.text', 'New Organization');
    cy.get('.p-dialog-header').should('not.exist');
  });

  it('add billing if not part of organization', () => {
    cy.setPermission(
      { verb: 'list', ...OrganizationPermissions },
      { verb: 'list', ...BillingEntityPermissions },
      { verb: 'create', ...BillingEntityPermissions }
    );
    setBillingEntities(cy);
    setOrganization(cy);
    cy.visit('/');
    cy.get('.p-dialog-header').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
    cy.get('#joinOrganizationDialogButton').should('exist');
    cy.get('#setDefaultOrganizationDialogButton').should('not.exist');
    cy.get('#addOrganizationDialogButton').should('not.exist');
    cy.get('#addBillingDialogButton').click();
    cy.get('.text-3xl > .ng-star-inserted').should('contain.text', 'New Billing');
    cy.get('.p-dialog-header').should('not.exist');
  });

  it('show dialog with button to set default org because user has no default organization yet', () => {
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig' }),
    }).as('getUser');
    cy.setPermission(
      { verb: 'list', ...OrganizationPermissions },
      { verb: 'list', ...BillingEntityPermissions },
      { verb: 'create', ...BillingEntityPermissions }
    );
    setOrganization(cy, organizationNxt);
    setBillingEntities(cy, billingEntityNxt);
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'nxt',
        userRefs: [{ name: 'mig' }],
      }),
    });

    cy.visit('/');
    cy.wait('@getUser');
    cy.get('.p-dialog-header').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
    cy.get('#joinOrganizationDialogButton').should('not.exist');
    cy.get('#addBillingDialogButton').should('not.exist');
    cy.get('#setDefaultOrganizationDialogButton').click();

    cy.get('.p-dialog-header').should('not.exist');
    cy.get('.text-3xl', { timeout: 1000000 }).should('contain.text', 'User');
  });
});

describe('hide dialog', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.removeItem('hideFirstTimeLoginDialog');
    cy.disableCookieBanner();
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig' }),
    });
  });

  it('do not show dialog again', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions });
    setOrganization(cy, organizationNxt);
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'nxt',
        userRefs: [{ name: 'mig' }, { name: 'miw' }],
      }),
    });

    cy.visit('/');

    cy.get('.p-dialog-header').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
    cy.get('#joinOrganizationDialogButton').should('not.exist');

    cy.get('label[for=hideFirstTimeLoginDialogCheckbox]').click();
    cy.get('#setDefaultOrganizationDialogButton').click();

    cy.get('.text-3xl').should('contain.text', 'User');

    cy.get('app-navbar-item').contains('Organizations').click();
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('.p-dialog-header').should('not.exist');
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
});

describe('skip dialog', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.removeItem('hideFirstTimeLoginDialog');
    cy.disableCookieBanner();
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
  });

  it('do not show dialog if member of organization', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions });
    setOrganization(cy, ...organizationListNxtVshn.items);
    cy.visit('/');
    cy.wait('@organizationList');
    cy.get('.p-dialog-header').should('not.exist');
  });

  it('do not show dialog when redeeming invitations', () => {
    cy.setPermission(
      { verb: 'list', ...OrganizationMembersPermissions },
      { verb: 'list', ...OrganizationPermissions },
      { verb: 'list', ...InvitationPermissions }
    );
    setOrganization(cy);
    cy.intercept('GET', 'appuio-api/apis/user.appuio.io/v1/invitations/uuid', {
      body: createInvitation({}),
    });
    cy.visit('/invitations/uuid');
    cy.get('#title').should('contain.text', 'Invitation');
    cy.get('.p-dialog-header').should('not.exist');
  });
});
