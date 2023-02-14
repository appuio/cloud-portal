import { createUser } from '../fixtures/user';
import { organizationListNxtVshn } from '../fixtures/organization';
import { createOrganizationMembers } from '../fixtures/organization-members';
import { createRoleBindingList } from 'cypress/fixtures/role-bindings';

describe('Test organization members', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
  });
  it('readonly list with two entries', () => {
    cy.setPermission(
      { verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' },
      {
        verb: 'list',
        resource: 'organizationmembers',
        group: 'appuio.io',
        namespace: 'nxt',
      }
    );
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'nxt',
        userRefs: [{ name: 'hans.meier' }, { name: 'peter.muster' }],
      }),
    });
    cy.intercept('GET', 'appuio-api/apis/rbac.authorization.k8s.io/v1/namespaces/nxt/rolebindings', {
      body: createRoleBindingList({
        namespace: 'nxt',
        roles: [
          { name: 'control-api:organization-admin', userRefs: [{ name: 'hans.meier' }] },
          { name: 'control-api:organization-viewer', userRefs: [{ name: 'hans.meier' }, { name: 'peter.muster' }] },
        ],
      }),
    });
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(2) > .flex-row [title="Edit members"]').click();
    cy.get('.text-3xl').should('contain.text', 'nxt Members');
    cy.get('[data-cy="name-input-0"]').should('have.value', 'hans.meier').and('be.disabled');
    cy.get('[data-cy="name-input-1"]').should('have.value', 'peter.muster').and('be.disabled');
    cy.get(':nth-child(2) .p-multiselect')
      .should('contain', 'control-api:organization-admin')
      .and('contain', 'control-api:organization-viewer')
      .and('have.class', 'p-disabled');
    cy.get(':nth-child(3) .p-multiselect')
      .should('contain', 'control-api:organization-viewer')
      .and('have.class', 'p-disabled');
    cy.get('button[type=submit]').should('not.exist');
  });
  it('edit list with two entries', () => {
    cy.setPermission(
      { verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' },
      { verb: 'list', resource: 'organizationmembers', group: 'appuio.io', namespace: 'nxt' },
      { verb: 'update', resource: 'organizationmembers', group: 'appuio.io', namespace: 'nxt' }
    );
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'nxt',
        userRefs: [{ name: 'hans.meier' }, { name: 'peter.muster' }],
      }),
    });
    cy.intercept('GET', 'appuio-api/apis/rbac.authorization.k8s.io/v1/namespaces/nxt/rolebindings', {
      body: createRoleBindingList({
        namespace: 'nxt',
        roles: [
          { name: 'control-api:organization-admin', userRefs: [{ name: 'hans.meier' }] },
          { name: 'control-api:organization-viewer', userRefs: [{ name: 'hans.meier' }, { name: 'peter.muster' }] },
        ],
      }),
    });
    cy.intercept('PUT', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'nxt',
        userRefs: [{ name: 'hans.meier' }, { name: 'peter.muster' }],
      }),
    }).as('save');
    cy.intercept(
      'PUT',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/namespaces/nxt/rolebindings/control-api:organization-admin',
      {
        body: {},
      }
    ).as('save-admin-role');
    cy.intercept(
      'PUT',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/namespaces/nxt/rolebindings/control-api:organization-viewer',
      {
        body: {},
      }
    ).as('save-viewer-role');
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(2) > .flex-row [title="Edit members"]').should('exist');
    cy.get(':nth-child(3) > .flex-row [title="Edit members"]').should('not.exist');
    cy.get(':nth-child(2) > .flex-row [title="Edit members"]').click();
    cy.get('.text-3xl').should('contain.text', 'nxt Members');
    cy.get('[data-cy="name-input-0"]').should('have.value', 'hans.meier');
    cy.get('[data-cy="name-input-1"]').should('have.value', 'peter.muster');
    cy.get('[data-cy="name-input-1"]').type('{selectall}test');
    cy.get('p-multiselect').eq(1).click().contains('control-api:organization-admin').click();
    cy.get('button[type=submit]').click();
    cy.wait('@save');
    cy.get('@save')
      .its('request.body')
      .then((body) => {
        expect(body.spec.userRefs[0].name).to.eq('hans.meier');
        expect(body.spec.userRefs[1].name).to.eq('test');
      });
    cy.wait('@save-admin-role');
    cy.get('@save-admin-role')
      .its('request.body')
      .then((body) => {
        expect(body.subjects[0].name).to.eq('appuio#hans.meier');
        expect(body.subjects[1].name).to.eq('appuio#test');
      });
    cy.wait('@save-viewer-role');
    cy.get('@save-viewer-role')
      .its('request.body')
      .then((body) => {
        expect(body.subjects[0].name).to.eq('appuio#hans.meier');
        expect(body.subjects[1].name).to.eq('appuio#test');
      });
  });
  it('add a new entry', () => {
    cy.setPermission(
      { verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' },
      { verb: 'list', resource: 'organizationmembers', group: 'appuio.io', namespace: 'nxt' },
      { verb: 'update', resource: 'organizationmembers', group: 'appuio.io', namespace: 'nxt' }
    );
    cy.visit('/organizations');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'nxt',
        userRefs: [{ name: 'hans.meier' }, { name: 'peter.muster' }],
      }),
    });
    cy.intercept('GET', 'appuio-api/apis/rbac.authorization.k8s.io/v1/namespaces/nxt/rolebindings', {
      body: createRoleBindingList({
        namespace: 'nxt',
        roles: [
          { name: 'control-api:organization-admin', userRefs: [{ name: 'hans.meier' }] },
          { name: 'control-api:organization-viewer', userRefs: [{ name: 'hans.meier' }, { name: 'peter.muster' }] },
        ],
      }),
    });
    cy.intercept('PUT', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'nxt',
        userRefs: [{ name: 'hans.meier' }, { name: 'peter.muster' }],
      }),
    }).as('save');
    cy.intercept(
      'PUT',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/namespaces/nxt/rolebindings/control-api:organization-admin',
      {
        body: {},
      }
    ).as('save-admin-role');
    cy.intercept(
      'PUT',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/namespaces/nxt/rolebindings/control-api:organization-viewer',
      {
        body: {},
      }
    ).as('save-viewer-role');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(2) > .flex-row [title="Edit members"]').click();
    cy.get('.text-3xl').should('contain.text', 'nxt Members');
    cy.get('[data-cy="name-input-0"]').first().should('have.value', 'hans.meier');
    cy.get('[data-cy="name-input-1"]').should('have.value', 'peter.muster');
    cy.get('[data-cy="name-input-2"]').type('{selectall}test');
    cy.get('button[type=submit]').click();
    cy.wait('@save');
    cy.get('@save')
      .its('request.body')
      .then((body) => {
        expect(body.spec.userRefs[0].name).to.eq('hans.meier');
        expect(body.spec.userRefs[1].name).to.eq('peter.muster');
        expect(body.spec.userRefs[2].name).to.eq('test');
      });
    cy.wait('@save-admin-role');
    cy.get('@save-admin-role')
      .its('request.body')
      .then((body) => {
        expect(body.subjects[0].name).to.eq('appuio#hans.meier');
      });
    cy.wait('@save-viewer-role');
    cy.get('@save-viewer-role')
      .its('request.body')
      .then((body) => {
        expect(body.subjects[0].name).to.eq('appuio#hans.meier');
        expect(body.subjects[1].name).to.eq('appuio#peter.muster');
        expect(body.subjects[2].name).to.eq('appuio#test');
      });
  });
  it('no list permission', () => {
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.visit('/organizations');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(2) > .flex-row [title="Edit members"]').should('not.exist');
  });
});
