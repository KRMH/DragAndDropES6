/**
 *Validation: we will use this interface for all the fields/attributes in the page
 */
export interface Validatable {
  value: string | number;
  required?: boolean;
  minlength?: number;
  maxlength?: number;
}

/**
 * This function will verify the value of all the fields in the page (if needed)
 * @param validatableInput
 * @returns
 */
export function validate(validatableInput: Validatable): boolean {
  let isValid: boolean = true;
  //required check
  if (validatableInput.required) {
    isValid =
      validatableInput.value.toString().trim().length === 0 ? false : true;
    if (!isValid) {
      return false;
    }
  }

  //minLength check
  if (validatableInput.minlength != null) {
    isValid =
      validatableInput.value.toString().trim().length >=
      validatableInput.minlength;
    if (!isValid) {
      return false;
    }
  }

  //maxLength check
  if (validatableInput.maxlength != null) {
    isValid =
      validatableInput.value.toString().trim().length <=
      validatableInput.maxlength;
    if (!isValid) {
      return false;
    }
  }

  return isValid;
}
