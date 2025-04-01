// lib/validations.ts
interface ValidationError {
    field: string;
    message: string;
  }
  
  type Validator<T> = (value: T) => string | null;
  
  export const inNumberArray = (arr: number[]): Validator<number> => {
    return (value) => (arr.includes(value) ? null : `Must be one of: ${arr.join(', ')}`);
  };
  
  export const isBetween = (min: number, max: number): Validator<number> => {
    return (value) =>
      value >= min && value <= max ? null : `Must be between ${min} and ${max}`;
  };
  
  export const isRequiredAllOrNone = (fields: string[]) => {
    return (obj: Record<string, any>): ValidationError[] => {
      const hasSome = fields.some((field) => obj[field] !== undefined);
      const hasAll = fields.every((field) => obj[field] !== undefined);
      
      if (hasSome && !hasAll) {
        return fields
          .filter((field) => obj[field] === undefined)
          .map((field) => ({
            field,
            message: `Required when any of ${fields.join(', ')} are present`,
          }));
      }
      return [];
    };
  };
  
  export const validateRequest = (
    obj: Record<string, any>,
    propValidations: Record<string, Validator<any>>,
    schemaValidations: ((obj: Record<string, any>) => ValidationError[])[]
  ): ValidationError[] => {
    let errors: ValidationError[] = [];
  
    // Property validations
    for (const [field, validator] of Object.entries(propValidations)) {
      if (obj[field] !== undefined) {
        const error = validator(obj[field]);
        if (error) {
          errors.push({ field, message: error });
        }
      }
    }
  
    // Schema validations
    schemaValidations.forEach((validator) => {
      errors = errors.concat(validator(obj));
    });
  
    return errors;
  };