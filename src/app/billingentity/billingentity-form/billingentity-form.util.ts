import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';

export const asdf = /^$/;

// Copied from https://github.com/angular/angular/blob/b3d2e3312ae682aeb96bc783cc44e9ee4575fda4/packages/forms/src/validators.ts#L18
function isEmptyInputValue(value: any): boolean {
  /**
   * Check if the object is a string or array before evaluating the length attribute.
   * This avoids falsely rejecting objects that contain a custom length attribute.
   * For example, the object {id: 1, length: 0, width: 0} should not be returned as empty.
   */
  return value == null || ((typeof value === 'string' || Array.isArray(value)) && value.length === 0);
}

export function multiEmail(control: AbstractControl): ValidationErrors | null {
  if (isEmptyInputValue(control.value)) {
    return null; // don't validate empty values to allow optional controls
  }
  if (!Array.isArray(control.value)) {
    return Validators.email(control);
  }
  const arr = control.value as string[];
  let allErrors: ValidationErrors | null = null;
  arr.forEach((v) => {
    const newControl = new FormControl<string>(v);
    const err = Validators.email(newControl);
    if (err !== null) {
      allErrors = err;
    }
  });
  return allErrors;
}
