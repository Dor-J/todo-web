import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator that rejects whitespace-only strings
 */
export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: { value: control.value } } : null;
  };
}

/**
 * Helper function to get validation error messages for form controls
 */
export function getValidationErrorMessage(
  control: AbstractControl | null,
  fieldName: string
): string | null {
  if (!control || !control.errors || !control.touched) {
    return null;
  }

  const errors = control.errors;

  if (errors['required']) {
    return `${fieldName} is required`;
  }

  if (errors['maxlength']) {
    const maxLength = errors['maxlength'].requiredLength;
    return `${fieldName} must be ${maxLength} characters or less`;
  }

  if (errors['whitespace']) {
    return `${fieldName} cannot be empty or only whitespace`;
  }

  return null;
}

