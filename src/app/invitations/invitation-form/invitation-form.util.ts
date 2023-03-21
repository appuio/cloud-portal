import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';

export function atLeastOneChecked<T extends AbstractControl<boolean, boolean>>(
  other: FormControl<boolean>
): (control: T) => ValidationErrors | null {
  return (control): ValidationErrors | null => {
    if (!control.value && !other.value) {
      const err = {
        atLeastOneRequired: 'at least one is required',
      };
      other.setErrors(err);
      other.markAsDirty();
      return err;
    }
    if (control.value) {
      other.setErrors(null);
    }
    return null;
  };
}
