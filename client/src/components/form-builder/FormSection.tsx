import React from 'react';
import { FormSection as FormSectionType } from '@/lib/xml-parser';
import FormField from '@/components/form-builder/FormField';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FormSectionProps {
  section: FormSectionType;
}

export default function FormSection({ section }: FormSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
        {section.description && (
          <CardDescription>{section.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {section.fields.map((field) => (
          <FormField key={field.id} field={field} />
        ))}
        
        {section.subSections?.map((subSection) => (
          <div key={subSection.id} className="mt-6 border-l-2 pl-4">
            <h3 className="text-lg font-semibold mb-2">{subSection.title}</h3>
            {subSection.description && (
              <p className="text-sm text-muted-foreground mb-4">{subSection.description}</p>
            )}
            <div className="space-y-4">
              {subSection.fields.map((field) => (
                <FormField key={field.id} field={field} />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}