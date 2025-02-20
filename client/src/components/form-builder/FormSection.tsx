import React from 'react';
import { FormSection as FormSectionType } from '@/lib/xml-parser';
import FormField from '@/components/form-builder/FormField';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FormSectionProps {
  section: FormSectionType;
}

export default function FormSection({ section }: FormSectionProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
        {section.description && (
          <CardDescription>{section.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {section.fields.map((field) => (
          <FormField
            key={field.id}
            field={field}
          />
        ))}
      </CardContent>
    </Card>
  );
}