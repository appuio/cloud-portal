import { FormControl } from '@angular/forms';

export interface BillingForm {
  companyEmail: FormControl<string[]>;
  displayName: FormControl<string>;
  phone: FormControl<string>;
  line1: FormControl<string>;
  line2: FormControl<string>;
  postal: FormControl<string>;
  city: FormControl<string>;
  country: FormControl<{ name: string } | undefined>;
  accountingName: FormControl<string>;
  accountingEmail: FormControl<string[]>;
  sameCompanyEmailsSelected: FormControl<boolean>;
}
