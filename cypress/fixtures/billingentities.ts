import { BillingEntity } from '../../src/app/types/billing-entity';

export const billingEntityNxt: BillingEntity = {
  kind: 'BillingEntity',
  apiVersion: 'billing.appuio.io/v1',
  metadata: {
    name: 'be-2345',
  },
  spec: {
    name: 'NXT Engineering',
    address: {
      line1: '📃',
      line2: '📋',
      postalCode: '🏤',
      city: '🏙️',
      country: '🇨🇭',
    },
    emails: ['📧'],
    phone: '☎️',
    languagePreference: '🇩🇪',
    accountingContact: {
      name: 'mig',
      emails: ['📧'],
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
    name: 'VSHN AG',
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
