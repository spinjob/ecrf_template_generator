import React from 'react';
import { useParams } from 'wouter';
import { parseECRFXml } from '@/lib/xml-parser';
import FormRenderer from '@/components/form-builder/FormRenderer';
import { Input } from '@/components/ui/input';
import { useFormData } from '@/contexts/FormDataContext';
import { useFormDefinition } from '@/contexts/FormDefinitionContext';

export default function FormViewer() {
  const { id } = useParams<{ id: string }>();
  const [subjectId, setSubjectId] = React.useState('');
  const { getFormData } = useFormData();
  const { getFormDefinition } = useFormDefinition();

  const formDef = getFormDefinition(parseInt(id));
  const formData = React.useMemo(() => {
    if (!id || !subjectId) return [];
    return getFormData(parseInt(id), subjectId);
  }, [id, subjectId, getFormData]);

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
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Enter Subject ID"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="max-w-xs"
        />
      </div>
      {subjectId && (
        <FormRenderer
          title={parsedForm.title}
          formDefinition={parsedForm}
          formId={parseInt(id)}
          subjectId={subjectId}
        />
      )}
    </div>
  );
}
