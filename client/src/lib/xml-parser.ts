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
  components?: FormField[];
  defaultValue?: string;
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
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minDate?: string;
    maxDate?: string;
    error_message?: string;
    maxLength?: number;
    decimal_places?: number;
  };
  options?: {
    option: Array<{ "@_value": string; text: string }> | { "@_value": string; text: string };
  };
  help_text?: string;
  columns?: { column: XMLFormField[] };
  group_fields?: { group_field: XMLFormField[] };
  components?: {
    component: XMLFormField | XMLFormField[];
  };
  default_value?: string;
}

interface XMLForm {
  "@_id": string;
  "@_version"?: string;
  form_metadata: FormMetadata;
  form_section: XMLFormSection | XMLFormSection[];
}

export function parseECRFXml(xmlContent: string): FormDefinition {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "text",
      parseAttributeValue: true,
      trimValues: true,
    });

    const parsed = parser.parse(xmlContent);
    console.log('Parsed XML:', JSON.stringify(parsed, null, 2));

    if (!parsed.ecrf_form) {
      throw new Error('XML must have ecrf_form as root element');
    }

    const form = parsed.ecrf_form as XMLForm;

    const formDef: FormDefinition = {
      id: form["@_id"],
      title: form.form_metadata.title,
      description: form.form_metadata.description,
      version: form["@_version"] || form.form_metadata.version,
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
  } catch (error) {
    console.error('Error parsing XML:', error);
    console.error('XML Content:', xmlContent);
    throw error;
  }
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
    components: field.components ? parseFields(field.components.component) : undefined,
    defaultValue: field.default_value,
  }));
}

function parseValidation(validation: XMLFormField['validation']): ValidationRule | undefined {
  if (!validation) return undefined;

  return {
    pattern: validation.pattern,
    min: validation.min,
    max: validation.max,
    minDate: validation.minDate,
    maxDate: validation.maxDate,
    errorMessage: validation.error_message,
    maxLength: validation.maxLength,
    decimalPlaces: validation.decimal_places,
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