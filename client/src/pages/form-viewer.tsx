import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { parseECRFXml } from '@/lib/xml-parser';
import FormRenderer from '@/components/form-builder/FormRenderer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormDefinition } from '@shared/schema';

export default function FormViewer() {
  const { id } = useParams<{ id: string }>();
  const [subjectId, setSubjectId] = React.useState('');

  const { data: formDef, isLoading } = useQuery<FormDefinition>({
    queryKey: [`/api/forms/${id}`],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-xl">Loading form...</div>
      </div>
    );
  }

  if (!formDef) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Form not found</div>
      </div>
    );
  }

  const parsedForm = parseECRFXml(formDef.xmlContent);

  return (
    <div className="container mx-auto py-8">
      <FormRenderer
        title={parsedForm.title}
        formDefinition={parsedForm}
        formId={parseInt(id)}
        subjectId={subjectId}
      />
    </div>
  );
}
