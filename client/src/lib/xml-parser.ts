import { XMLParser } from "fast-xml-parser";

export interface ValidationRule {
  pattern?: string;
  min?: number;
  max?: number;
  minDate?: string;
  maxDate?: string;
  errorMessage?: string;
  maxLength?: number;
  decimalPlaces?: number;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  validation?: ValidationRule;
  options?: FieldOption[];
  helpText?: string;
  columns?: FormField[];
  groupFields?: FormField[];
}

export interface FormSection {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
}

export interface FormDefinition {
  id: string;
  title: string;
  description: string;
  version: string;
  lastModified: string;
  sections: FormSection[];
}

interface FormMetadata {
  title: string;
  description: string;
  version: string;
  last_modified: string;
}

interface XMLFormSection {
  "@_id": string;
  section_title: string;
  section_description: string;
  input_field: XMLFormField | XMLFormField[];
}

interface XMLFormField {
  field_id: string;
  label: string;
  type: string;
  required: string;
  validation?: ValidationRule;
  options?: {
    option: Array<{ "@_value": string; text: string }> | { "@_value": string; text: string };
  };
  help_text?: string;
  columns?: { column: XMLFormField[] };
  group_fields?: { group_field: XMLFormField[] };
}

interface XMLForm {
  "@_id": string;
  form_metadata: FormMetadata;
  form_section: XMLFormSection | XMLFormSection[];
}

export function parseECRFXml(xmlContent: string): FormDefinition {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "text",
    parseAttributeValue: true,
  });

  const parsed = parser.parse(xmlContent);
  const form = parsed.ecrf_form as XMLForm;

  const formDef: FormDefinition = {
    id: form["@_id"],
    title: form.form_metadata.title,
    description: form.form_metadata.description,
    version: form.form_metadata.version,
    lastModified: form.form_metadata.last_modified,
    sections: [],
  };

  // Parse sections
  const sections = Array.isArray(form.form_section) 
    ? form.form_section 
    : [form.form_section];

  formDef.sections = sections.map((section: XMLFormSection) => ({
    id: section["@_id"],
    title: section.section_title,
    description: section.section_description,
    fields: parseFields(section.input_field),
  }));

  return formDef;
}

function parseFields(fields: XMLFormField | XMLFormField[]): FormField[] {
  if (!Array.isArray(fields)) {
    fields = [fields];
  }

  return fields.map((field: XMLFormField) => ({
    id: field.field_id,
    label: field.label,
    type: field.type,
    required: field.required === "true",
    validation: parseValidation(field.validation),
    options: parseOptions(field.options),
    helpText: field.help_text,
    columns: field.columns ? parseFields(field.columns.column) : undefined,
    groupFields: field.group_fields ? parseFields(field.group_fields.group_field) : undefined,
  }));
}

function parseValidation(validation: ValidationRule | undefined): ValidationRule | undefined {
  if (!validation) return undefined;

  return {
    pattern: validation.pattern,
    min: validation.min,
    max: validation.max,
    minDate: validation.minDate,
    maxDate: validation.maxDate,
    errorMessage: validation.errorMessage,
    maxLength: validation.maxLength,
    decimalPlaces: validation.decimalPlaces,
  };
}

function parseOptions(options: XMLFormField['options']): FieldOption[] | undefined {
  if (!options?.option) return undefined;

  const optionArray = Array.isArray(options.option) 
    ? options.option 
    : [options.option];

  return optionArray.map(opt => ({
    value: opt["@_value"],
    label: opt.text,
  }));
}