import { createUser } from '../fixtures/user';
import { Invitation, InvitationPermissions, InvitationSpec } from '../../src/app/types/invitation';
import { BillingEntityPermissions } from '../../src/app/types/billing-entity';
import { OrganizationPermissions } from '../../src/app/types/organization';
import { organizationNxt, organizationVshn, setOrganization } from '../fixtures/organization';
import { billingEntityNxt, setBillingEntities } from '../fixtures/billingentities';
import { createInvitation } from '../fixtures/invitations';
import { createTeam, setTeam, team1 } from '../fixtures/team';

describe('Test invitation create', () => {
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
    cy.setPermission(
      { verb: 'list', ...InvitationPermissions },
      { verb: 'create', ...InvitationPermissions },
      { verb: 'list', ...BillingEntityPermissions },
      { verb: 'list', ...OrganizationPermissions }
    );
  });

  it('should make fields required', () => {
    setOrganization(cy, organizationNxt);
    setBillingEntities(cy);
    setTeam(cy, 'nxt');

    cy.visit('/invitations/create');
    cy.get('#title').should('contain.text', 'Invite User');
    cy.get('button[type=submit]').should('be.disabled');
    cy.get('#email').type('dev@nxt.engineering');
    cy.get('button[type=submit]').should('be.enabled').click();
    cy.get('.p-error').should('contain.text', 'Please select at least one element');
  });

  it('should select organization without team and roles', () => {
    setOrganization(cy, organizationNxt);
    setBillingEntities(cy);
    setTeam(cy, 'nxt');
    cy.intercept('POST', 'appuio-api/apis/user.appuio.io/v1/invitations', {
      body: createInvitation({}),
    }).as('createInvitation');

    cy.visit('/invitations/create');

    cy.get('#title').should('contain.text', 'Invite User');
    cy.get('#email').type('dev@nxt.engineering');
    cy.get('p-checkbox input').should('be.disabled');
    cy.get('p-dropdown').eq(0).click().contains('nxt').click();
    cy.get('button[type=submit]').should('be.enabled').click();

    cy.wait('@createInvitation')
      .its('request.body')
      .then((body: Invitation) => {
        const spec = body.spec;

        console.debug('received spec', spec);
        const expectedSpec: InvitationSpec = createInvitation({
          organizations: [{ name: 'nxt' }],
        }).spec;
        expectedSpec.note = '';
        console.debug('expected spec', expectedSpec);
        expect(spec).deep.eq(expectedSpec);
      });
  });

  it('should select organization with team and roles', () => {
    setOrganization(cy, organizationNxt);
    setBillingEntities(cy);
    setTeam(cy, 'nxt', team1);
    cy.intercept('POST', 'appuio-api/apis/user.appuio.io/v1/invitations', {
      body: createInvitation({}),
    }).as('createInvitation');

    cy.visit('/invitations/create');

    cy.get('#title').should('contain.text', 'Invite User');
    cy.get('#email').type('dev@nxt.engineering');
    cy.get('#note').type('New Employee working for 👁️');

    cy.get('p-checkbox input').should('be.disabled');
    cy.get('p-dropdown').eq(0).click().contains('nxt').click();
    cy.get('p-checkbox').eq(0).click();
    cy.get('p-multiselect').eq(0).click().contains('team1').click();
    cy.get('button[type=submit]').should('be.enabled').click();

    cy.wait('@createInvitation')
      .its('request.body')
      .then((body: Invitation) => {
        const spec = body.spec;

        console.debug('received spec', spec);
        const expectedSpec: InvitationSpec = createInvitation({
          organizations: [{ name: 'nxt', role: 'viewer', teams: ['team1'] }],
        }).spec;
        console.debug('expected spec', expectedSpec);
        expect(spec).deep.eq(expectedSpec);
      });
  });

  it('should switch teams per organization', () => {
    setOrganization(cy, organizationNxt, organizationVshn);
    setBillingEntities(cy);
    setTeam(cy, 'nxt', team1);
    setTeam(
      cy,
      'vshn',
      createTeam({ namespace: 'vshn', name: 'ops-team' }),
      createTeam({ namespace: 'vshn', name: 'another' })
    );

    cy.visit('/invitations/create');

    cy.get('#title').should('contain.text', 'Invite User');
    cy.get('#email').type('dev@nxt.engineering');
    cy.get('#note').type('New Employee working for 👁️');

    cy.get('p-dropdown').eq(0).click().contains('nxt').click();
    cy.get('p-multiselect').eq(0).click().contains('Super').click();
    cy.get('body').type('{esc}');
    cy.get('p-dropdown').eq(0).click().contains('DevOps').click();
    cy.get('p-multiselect').eq(0).should('contain.text', 'Select Team');
    cy.get('p-multiselect').eq(0).click().contains('ops-team').click();
    cy.get('p-multiselect').eq(0).contains('another').click();
  });

  it('should select billing', () => {
    setOrganization(cy);
    setBillingEntities(cy, billingEntityNxt);
    cy.intercept('POST', 'appuio-api/apis/user.appuio.io/v1/invitations', {
      body: createInvitation({}),
    }).as('createInvitation');

    cy.visit('/invitations/create');

    cy.get('#title').should('contain.text', 'Invite User');
    cy.get('#email').type('dev@nxt.engineering');
    cy.get('#note').type('New Employee working for 👁️');

    cy.get('p-checkbox input').should('be.disabled');
    cy.get('p-dropdown').eq(0).click().contains('be-2345').click();
    cy.get('p-checkbox').eq(0).click();
    cy.get('button[type=submit]').should('be.enabled').click();

    cy.wait('@createInvitation')
      .its('request.body')
      .then((body: Invitation) => {
        const spec = body.spec;

        console.debug('received spec', spec);
        const expectedSpec: InvitationSpec = createInvitation({
          billingEntities: [{ name: 'be-2345', role: 'viewer' }],
        }).spec;
        console.debug('expected spec', expectedSpec);
        expect(spec).deep.eq(expectedSpec);
      });
  });

  it('should select billing role', () => {
    setOrganization(cy);
    setBillingEntities(cy, billingEntityNxt);

    cy.visit('/invitations/create');

    cy.get('#title').should('contain.text', 'Invite User');
    cy.get('#email').type('dev@nxt.engineering');
    cy.get('#note').type('New Employee working for 👁️');

    cy.get('p-checkbox input').should('be.disabled');
    cy.get('p-dropdown').eq(0).click().contains('be-2345').click();
    cy.get('small.p-error').should('contain.text', 'Select at least one role');
    cy.get('p-checkbox input').should('be.enabled');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('p-checkbox').eq(1).click();
    cy.get('button[type=submit]').should('be.enabled'); // admin selected
    cy.get('p-checkbox').eq(0).click();
    cy.get('button[type=submit]').should('be.enabled'); // both selected
    cy.get('p-checkbox').eq(1).click();
    cy.get('button[type=submit]').should('be.enabled'); // viewer selected (admin unselected)
    cy.get('p-checkbox').eq(0).click();
    cy.get('button[type=submit]').should('be.disabled'); // none selected

    cy.get('p-dropdown').eq(1).should('exist');
    cy.get('button[type=button').click();
    cy.get('p-dropdown').eq(1).should('not.exist');
    cy.get('button[type=submit]').should('be.enabled');
  });
});

describe('limited permissions', () => {
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
    cy.setPermission({ verb: 'list', ...InvitationPermissions }, { verb: 'create', ...InvitationPermissions });
    cy.visit('/invitations/create');
    cy.get('#no-permissions').should(
      'contain.text',
      'You cannot invite users without having enough permissions by yourself'
    );
  });

  it('no organizations or billing entities available', () => {
    cy.setPermission(
      { verb: 'list', ...InvitationPermissions },
      { verb: 'create', ...InvitationPermissions },
      { verb: 'list', ...OrganizationPermissions },
      { verb: 'list', ...BillingEntityPermissions }
    );
    setOrganization(cy);
    setBillingEntities(cy);

    cy.visit('/invitations/create');
    cy.get('#no-permissions').should(
      'contain.text',
      'You cannot invite users without having enough permissions by yourself'
    );
  });

  it('only billing list permissions', () => {
    cy.setPermission(
      { verb: 'list', ...InvitationPermissions },
      { verb: 'create', ...InvitationPermissions },
      { verb: 'list', ...BillingEntityPermissions }
    );
    setBillingEntities(cy, billingEntityNxt);

    cy.visit('/invitations/create');
    cy.get('#title').should('contain.text', 'Invite User');
    cy.get('#organizationFormGroup').should('not.exist');
    cy.get('#billingFormGroup').should('exist');
  });

  it('only organization list permissions', () => {
    cy.setPermission(
      { verb: 'list', ...InvitationPermissions },
      { verb: 'create', ...InvitationPermissions },
      { verb: 'list', ...OrganizationPermissions }
    );
    setOrganization(cy, organizationVshn);
    setTeam(cy, 'vshn');

    cy.visit('/invitations/create');
    cy.get('#title').should('contain.text', 'Invite User');
    cy.get('#organizationFormGroup').should('exist');
    cy.get('#billingFormGroup').should('not.exist');
  });

  it('only organization and team list permissions', () => {
    cy.setPermission(
      { verb: 'list', ...InvitationPermissions },
      { verb: 'create', ...InvitationPermissions },
      { verb: 'list', ...OrganizationPermissions }
    );
    setOrganization(cy, organizationNxt);
    setTeam(cy, 'nxt', team1);

    cy.visit('/invitations/create');
    cy.wait('@teamList-nxt');
    cy.get('#title').should('contain.text', 'Invite User');
    cy.get('#organizationFormGroup').should('exist');
    cy.get('#billingFormGroup').should('not.exist');
  });
});

describe('degradation', () => {
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

  it('failed billing entities', () => {
    cy.setPermission(
      { verb: 'list', ...InvitationPermissions },
      { verb: 'create', ...InvitationPermissions },
      { verb: 'list', ...OrganizationPermissions },
      { verb: 'list', ...BillingEntityPermissions }
    );
    setOrganization(cy, organizationNxt);
    setTeam(cy, 'nxt');
    cy.intercept('GET', 'appuio-api/apis/billing.appuio.io/v1/billingentities', {
      statusCode: 503,
    });

    cy.visit('/invitations/create');
    cy.get('#organizationFormGroup').should('exist');
    cy.get('#billingFormGroup').should('not.exist');
    cy.get('#warning-message').should('contain.text', 'Billing Entities could not be loaded at the moment.');
  });
});
