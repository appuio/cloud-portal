import { createUser } from '../fixtures/user';
import { BillingEntityPermissions } from '../../src/app/types/billing-entity';
import { ClusterRoleBinding, ClusterRoleBindingPermissions } from '../../src/app/types/clusterrole-binding';
import { billingEntityNxt } from '../fixtures/billingentities';
import { createClusterRoleBinding } from '../fixtures/clusterrole-binding';
import { createClusterRole } from '../fixtures/clusterrole';
import { ClusterRole, ClusterRolePermissions } from '../../src/app/types/clusterRole';

describe('billing entity edit members with existing admin roles', () => {
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
      { verb: 'get', ...BillingEntityPermissions, name: 'be-2345' },
      { verb: 'get', ...ClusterRoleBindingPermissions, name: 'billingentities-be-2345-viewer' },
      { verb: 'get', ...ClusterRoleBindingPermissions, name: 'billingentities-be-2345-admin' },
      { verb: 'update', ...ClusterRoleBindingPermissions, name: 'billingentities-be-2345-viewer' },
      { verb: 'update', ...ClusterRoleBindingPermissions, name: 'billingentities-be-2345-admin' }
    );
    cy.intercept('GET', 'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterroles/billingentities-be-2345-admin', {
      body: createClusterRole('be-2345'),
    });
  });

  it('add member', () => {
    cy.intercept('GET', 'appuio-api/apis/billing.appuio.io/v1/billingentities/be-2345', {
      body: billingEntityNxt,
    });
    cy.intercept(
      'GET',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-viewer',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-viewer', users: ['appuio#mig'] }),
      }
    );
    cy.intercept(
      'GET',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-admin',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-admin', users: ['appuio#mig'] }),
      }
    );
    cy.intercept(
      'PUT',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-viewer',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-viewer', users: ['appuio#mig', 'appuio#crc'] }),
      }
    ).as('updateViewer');
    cy.intercept(
      'PUT',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-admin',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-admin', users: ['appuio#mig', 'appuio#crc'] }),
      }
    ).as('updateAdmin');

    cy.visit('/billingentities/be-2345/members');
    cy.get('.text-3xl').should('contain.text', 'be-2345 Members');
    cy.get('[data-cy="name-input-1"]').type('crc');
    cy.get('p-multiselect').eq(1).click().contains('billingentities-be-2345-admin').click();
    cy.get('button[type=submit]').click();
    cy.wait('@updateViewer');
    cy.wait('@updateAdmin');
    cy.get('@updateViewer')
      .its('request.body')
      .then((body: ClusterRoleBinding) => {
        expect(body.subjects).to.have.length(2);
        const subject = body.subjects && body.subjects[1];
        expect(subject && subject.name).to.eq('appuio#crc');
      });
    cy.get('@updateAdmin')
      .its('request.body')
      .then((body: ClusterRoleBinding) => {
        expect(body.subjects).to.have.length(2);
        const subject = body.subjects && body.subjects[1];
        expect(subject && subject.name).to.eq('appuio#crc');
      });
  });

  it('delete member', () => {
    cy.intercept('GET', 'appuio-api/apis/billing.appuio.io/v1/billingentities/be-2345', {
      body: billingEntityNxt,
    });
    cy.intercept(
      'GET',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-viewer',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-viewer', users: ['appuio#mig', 'appuio#crc'] }),
      }
    );
    cy.intercept(
      'GET',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-admin',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-admin', users: ['appuio#mig', 'appuio#crc'] }),
      }
    );
    cy.intercept(
      'PUT',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-viewer',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-viewer', users: ['appuio#mig'] }),
      }
    ).as('updateViewer');
    cy.intercept(
      'PUT',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-admin',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-admin', users: ['appuio#mig'] }),
      }
    ).as('updateAdmin');

    cy.visit('/billingentities/be-2345/members');
    cy.get('.text-3xl').should('contain.text', 'be-2345 Members');
    cy.get('button[title="Remove"]').eq(1).click();
    cy.get('button[type=submit]').click();
    cy.wait('@updateViewer');
    cy.wait('@updateAdmin');
    cy.get('@updateViewer')
      .its('request.body')
      .then((body: ClusterRoleBinding) => {
        expect(body.subjects).to.have.length(1);
        const subject = body.subjects && body.subjects[0];
        expect(subject && subject.name).to.eq('appuio#mig');
      });
    cy.get('@updateAdmin')
      .its('request.body')
      .then((body: ClusterRoleBinding) => {
        expect(body.subjects).to.have.length(1);
        const subject = body.subjects && body.subjects[0];
        expect(subject && subject.name).to.eq('appuio#mig');
      });
  });

  it('delete member shows warning if removing own user', () => {
    cy.intercept('GET', 'appuio-api/apis/billing.appuio.io/v1/billingentities/be-2345', {
      body: billingEntityNxt,
    });
    cy.intercept(
      'GET',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-viewer',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-viewer', users: ['appuio#mig', 'appuio#crc'] }),
      }
    );
    cy.intercept(
      'GET',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-admin',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-admin', users: ['appuio#mig', 'appuio#crc'] }),
      }
    );

    cy.visit('/billingentities/be-2345/members');
    cy.get('.text-3xl').should('contain.text', 'be-2345 Members');
    cy.get('button[title="Remove"]').eq(0).click();
    cy.get('p-message').contains('You are about to remove yourself as admin!');
  });

  it('unassign role', () => {
    cy.intercept('GET', 'appuio-api/apis/billing.appuio.io/v1/billingentities/be-2345', {
      body: billingEntityNxt,
    });
    cy.intercept(
      'GET',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-viewer',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-viewer', users: ['appuio#mig', 'appuio#crc'] }),
      }
    );
    cy.intercept(
      'GET',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-admin',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-admin', users: ['appuio#mig', 'appuio#crc'] }),
      }
    );
    cy.intercept(
      'PUT',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-viewer',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-viewer', users: ['appuio#mig', 'appuio#crc'] }),
      }
    ).as('updateViewer');
    cy.intercept(
      'PUT',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-admin',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-admin', users: ['appuio#mig'] }),
      }
    ).as('updateAdmin');

    cy.visit('/billingentities/be-2345/members');
    cy.get('.text-3xl').should('contain.text', 'be-2345 Members');
    const multiSelect = cy.get('p-multiselect').eq(1);
    multiSelect.click();
    multiSelect.get('p-multiselectitem').contains('billingentities-be-2345-admin').click();
    cy.get('button[type=submit]').click();
    cy.wait('@updateViewer');
    cy.wait('@updateAdmin');
    cy.get('@updateViewer')
      .its('request.body')
      .then((body: ClusterRoleBinding) => {
        expect(body.subjects).to.have.length(2);
        const mig = body.subjects && body.subjects[0];
        const crc = body.subjects && body.subjects[1];
        expect(mig && mig.name).to.eq('appuio#mig');
        expect(crc && crc.name).to.eq('appuio#crc');
      });
    cy.get('@updateAdmin')
      .its('request.body')
      .then((body: ClusterRoleBinding) => {
        expect(body.subjects).to.have.length(1);
        const subject = body.subjects && body.subjects[0];
        expect(subject && subject.name).to.eq('appuio#mig');
      });
  });

  it('unassign role shows warning if removing own user', () => {
    cy.intercept('GET', 'appuio-api/apis/billing.appuio.io/v1/billingentities/be-2345', {
      body: billingEntityNxt,
    });
    cy.intercept(
      'GET',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-viewer',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-viewer', users: ['appuio#mig', 'appuio#crc'] }),
      }
    );
    cy.intercept(
      'GET',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-admin',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-admin', users: ['appuio#mig', 'appuio#crc'] }),
      }
    );
    cy.visit('/billingentities/be-2345/members');
    cy.get('.text-3xl').should('contain.text', 'be-2345 Members');
    const multiSelect = cy.get('p-multiselect').eq(0);
    multiSelect.click();
    multiSelect.get('p-multiselectitem').contains('billingentities-be-2345-admin').click();
    cy.get('p-message').contains('You are about to remove yourself as admin!');
  });
});

describe('billing entity edit members without admin roles', () => {
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
      { verb: 'get', ...BillingEntityPermissions, name: 'be-2345' },
      { verb: 'get', ...ClusterRoleBindingPermissions, name: 'billingentities-be-2345-viewer' },
      { verb: 'update', ...ClusterRoleBindingPermissions, name: 'billingentities-be-2345-admin' },
      { verb: 'update', ...ClusterRoleBindingPermissions, name: 'billingentities-be-2345-viewer' },
      { verb: 'update', ...ClusterRolePermissions, name: 'billingentities-be-2345-admin' }
    );
    cy.intercept('GET', 'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterroles/billingentities-be-2345-admin', {
      statusCode: 404,
    });
  });

  it('add member', () => {
    cy.intercept('GET', 'appuio-api/apis/billing.appuio.io/v1/billingentities/be-2345', {
      body: billingEntityNxt,
    });
    cy.intercept(
      'GET',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-viewer',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-viewer', users: [] }),
      }
    );
    cy.intercept(
      'GET',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-admin',
      {
        statusCode: 404,
      }
    );
    cy.intercept('POST', 'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterroles', {
      body: createClusterRole('be-2345'),
    }).as('createAdminRole');

    cy.intercept(
      'PUT',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-viewer',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-viewer', users: ['appuio#crc'] }),
      }
    ).as('updateViewer');
    cy.intercept(
      'PUT',
      'appuio-api/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/billingentities-be-2345-admin',
      {
        body: createClusterRoleBinding({ name: 'billingentities-be-2345-admin', users: ['appuio#crc'] }),
      }
    ).as('createAdminBinding');
    cy.visit('/billingentities/be-2345/members');
    cy.get('.text-3xl').should('contain.text', 'be-2345 Members');
    cy.get('[data-cy="name-input-0"]').type('crc');
    cy.get('p-multiselect').eq(0).click().contains('billingentities-be-2345-admin').click();
    cy.get('button[type=submit]').click();
    cy.wait('@updateViewer');
    cy.wait('@createAdminBinding');
    cy.wait('@createAdminRole');
    cy.get('@updateViewer')
      .its('request.body')
      .then((body: ClusterRoleBinding) => {
        expect(body.subjects).to.have.length(1);
        const subject = body.subjects && body.subjects[0];
        expect(subject && subject.name).to.eq('appuio#crc');
      });
    cy.get('@createAdminBinding')
      .its('request.body')
      .then((body: ClusterRoleBinding) => {
        expect(body.subjects).to.have.length(1);
        const subject = body.subjects && body.subjects[0];
        expect(subject && subject.name).to.eq('appuio#crc');
      });
    cy.get('@createAdminRole')
      .its('request.body')
      .then((body: ClusterRole) => {
        expect(body.rules).to.have.length(2);
        const rule = body.rules && body.rules[0];
        expect(rule && rule.resourceNames).to.include('billingentities-be-2345-admin');
      });
  });
});
