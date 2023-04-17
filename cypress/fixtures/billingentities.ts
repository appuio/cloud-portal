import { BillingEntity } from '../../src/app/types/billing-entity';

export const billingEntityNxt: BillingEntity = {
  kind: 'BillingEntity',
  apiVersion: 'billing.appuio.io/v1',
  metadata: {
    name: 'be-2345',
  },
  spec: {
    name: '➡️ Engineering GmbH',
    address: {
      line1: '📃',
      line2: '📋',
      postalCode: '🏤',
      city: '🏙️',
      country: 'Switzerland',
    },
    emails: ['hallo@nxt.engineering'],
    phone: '☎️',
    languagePreference: '🇩🇪',
    accountingContact: {
      name: 'mig',
      emails: ['hallo@nxt.engineering'],
    },
  },
};

export const billingEntityVshn: BillingEntity = {
  kind: 'BillingEntity',
  apiVersion: 'billing.appuio.io/v1',
  metadata: {
    name: 'be-2347',
  },
  spec: {
    name: '👁️ AG',
    address: {
      line1: '📃',
      line2: '📋',
      postalCode: '🏤',
      city: '🏙️',
      country: '🇨🇭',
    },
    emails: ['📧'],
    phone: '☎️',
    languagePreference: '🇬🇧',
    accountingContact: {
      name: 'mig',
      emails: ['📧'],
    },
  },
};

export function setBillingEntities(cy: Cypress.cy, ...be: BillingEntity[]): void {
  cy.intercept('GET', 'appuio-api/apis/billing.appuio.io/v1/billingentities', {
    body: { items: [...be] },
  });
}
