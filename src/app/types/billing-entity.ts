import { KubeObject } from './entity';

export const BillingEntityPermissions = { group: 'billing.appuio.io', resource: 'billingentities' };

export interface BillingEntity extends KubeObject {
  kind: 'BillingEntity';
  apiVersion: 'billing.appuio.io/v1';
  spec: BillingEntitySpec;
}

export interface BillingEntitySpec {
  name?: string;
  phone?: string;
  emails?: string[];
  address?: BillingEntityAddress;
  accountingContact?: BillingEntityContact;
  languagePreference?: string;
}

export interface BillingEntityAddress {
  line1?: string;
  line2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface BillingEntityContact {
  name?: string;
  emails?: string[];
}

export interface BillingEntityList {
  kind: 'BillingEntityList';
  apiVersion: 'billing.appuio.io/v1';
  metadata: object;
  items: BillingEntity[];
}
