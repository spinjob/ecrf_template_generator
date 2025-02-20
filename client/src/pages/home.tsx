import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { parseECRFXml } from '@/lib/xml-parser';

export default function Home() {
  const [xmlContent, setXmlContent] = React.useState('');
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate XML by parsing it
      const parsedForm = parseECRFXml(xmlContent);

      if (!parsedForm.title || !parsedForm.version) {
        throw new Error('XML must include title and version in form_metadata');
      }

      // Create form definition
      const response = await apiRequest('POST', '/api/forms', {
        title: parsedForm.title,
        version: parsedForm.version,
        xmlContent,
      });

      const result = await response.json();

      toast({
        title: 'Success',
        description: 'Form created successfully',
      });

      // Navigate to form viewer
      navigate(`/forms/${result.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create form',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>eCRF Form Generator</CardTitle>
          <CardDescription>
            Paste your XML form definition below to create a new form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={xmlContent}
              onChange={(e) => setXmlContent(e.target.value)}
              placeholder="Paste your XML here..."
              className="min-h-[300px] font-mono"
            />
            <Button type="submit" disabled={!xmlContent.trim()}>
              Create Form
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}