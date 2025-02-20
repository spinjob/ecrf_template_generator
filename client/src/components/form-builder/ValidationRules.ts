import { z } from 'zod';
import { FormField, ValidationRule } from '@/lib/xml-parser';

/**
 * Creates a Zod validation schema for a specific form field based on its type and validation rules
 */
export function createFieldValidation(field: FormField): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  // Base type validation
  switch (field.type) {
    case 'number':
    case 'decimal': {
      const numSchema = z.number({
        invalid_type_error: `${field.label} must be a valid number`,
        required_error: field.required ? `${field.label} is required` : undefined,
      });

      if (field.validation) {
        let validatedSchema = numSchema;
        if (field.validation.min !== undefined) {
          validatedSchema = validatedSchema.min(field.validation.min);
        }
        if (field.validation.max !== undefined) {
          validatedSchema = validatedSchema.max(field.validation.max);
        }
        if (field.validation.decimalPlaces !== undefined) {
          const multiplier = 1 / Math.pow(10, field.validation.decimalPlaces);
          validatedSchema = validatedSchema.step(multiplier);
        }
        schema = validatedSchema;
      } else {
        schema = numSchema;
      }
      break;
    }

    case 'date': {
      const dateSchema = z.string({
        invalid_type_error: `${field.label} must be a valid date`,
        required_error: field.required ? `${field.label} is required` : undefined,
      });

      if (field.validation) {
        let validatedSchema = dateSchema;
        if (field.validation.minDate) {
          validatedSchema = validatedSchema.min(field.validation.minDate);
        }
        if (field.validation.maxDate) {
          validatedSchema = validatedSchema.max(field.validation.maxDate);
        }
        schema = validatedSchema;
      } else {
        schema = dateSchema;
      }
      break;
    }

    case 'checkbox':
      if (field.options) {
        const checkboxSchema: Record<string, z.ZodType<boolean | undefined>> = {};
        field.options.forEach(option => {
          checkboxSchema[option.value] = z.boolean().optional();
        });
        schema = z.object(checkboxSchema);
      } else {
        schema = z.boolean();
      }
      break;

    case 'table':
      if (field.columns) {
        const rowSchema: Record<string, z.ZodTypeAny> = {};
        field.columns.forEach(column => {
          rowSchema[column.id] = createFieldValidation(column);
        });
        schema = z.array(z.object(rowSchema));
      } else {
        schema = z.array(z.unknown());
      }
      break;

    case 'group':
      if (field.groupFields) {
        const groupSchema: Record<string, z.ZodTypeAny> = {};
        field.groupFields.forEach(groupField => {
          groupSchema[groupField.id] = createFieldValidation(groupField);
        });
        schema = z.object(groupSchema);
      } else {
        schema = z.object({});
      }
      break;

    default: {
      const stringSchema = z.string({
        invalid_type_error: `${field.label} must be valid text`,
        required_error: field.required ? `${field.label} is required` : undefined,
      });

      if (field.validation) {
        let validatedSchema = stringSchema;
        if (field.validation.pattern) {
          validatedSchema = validatedSchema.regex(new RegExp(field.validation.pattern), {
            message: field.validation.errorMessage || `${field.label} has an invalid format`,
          });
        }
        if (field.validation.maxLength) {
          validatedSchema = validatedSchema.max(field.validation.maxLength, {
            message: `${field.label} must not exceed ${field.validation.maxLength} characters`,
          });
        }
        schema = validatedSchema;
      } else {
        schema = stringSchema;
      }
    }
  }

  // Apply optional if not required
  if (!field.required) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Utility function to validate a single field value against its validation rules
 */
export function validateFieldValue(
  value: unknown, 
  field: FormField, 
  validationRules?: ValidationRule
): string | null {
  const schema = createFieldValidation(field);

  try {
    schema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return 'Invalid value';
  }
}

/**
 * Creates a complete form validation schema based on all fields in a section
 */
export function createSectionValidationSchema(fields: FormField[]): z.ZodObject<any> {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  fields.forEach(field => {
    schemaFields[field.id] = createFieldValidation(field);
  });

  return z.object(schemaFields);
}