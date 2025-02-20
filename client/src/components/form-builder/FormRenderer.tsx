import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormDefinition, FormField } from '@/lib/xml-parser';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import FormSection from './FormSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';
import { createFieldValidation } from './ValidationRules';

interface FormRendererProps {
  formDefinition: FormDefinition;
  formId: number;
  subjectId?: string;
}

export default function FormRenderer({ formDefinition, formId, subjectId }: FormRendererProps) {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = React.useState(formDefinition.sections[0].id);

  // Create dynamic validation schema based on form definition
  const validationSchema = React.useMemo(() => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    formDefinition.sections.forEach(section => {
      section.fields.forEach(field => {
        schemaFields[field.id] = createFieldValidation(field);
      });
    });

    return z.object(schemaFields);
  }, [formDefinition]);

  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {},
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      if (!subjectId) {
        toast({
          title: "Error",
          description: "Subject ID is required",
          variant: "destructive",
        });
        return;
      }

      await apiRequest('POST', `/api/forms/${formId}/data`, {
        subjectId,
        sectionId: activeSection,
        data,
        isDraft: false,
      });

      toast({
        title: "Success",
        description: "Form data saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save form data",
        variant: "destructive",
      });
    }
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-[calc(100vh-4rem)]">
          <Tabs value={activeSection} onValueChange={setActiveSection} className="flex-1 flex flex-col">
            <TabsList className="w-full flex flex-wrap sticky top-0 bg-background z-10 border-b">
              {formDefinition.sections.map(section => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex-grow"
                >
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-12rem)] w-full px-4">
                {formDefinition.sections.map(section => (
                  <TabsContent key={section.id} value={section.id} className="mt-4">
                    <FormSection
                      section={section}
                    />
                  </TabsContent>
                ))}
              </ScrollArea>
            </div>
          </Tabs>

          <div className="flex justify-end gap-4 sticky bottom-0 bg-background p-4 border-t mt-auto">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}