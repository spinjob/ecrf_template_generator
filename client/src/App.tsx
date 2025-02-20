import React from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import FormViewer from "@/pages/form-viewer";
import Home from "@/pages/home";
import { FormDataProvider } from './contexts/FormDataContext';
import { FormDefinitionProvider } from './contexts/FormDefinitionContext';
import { useFormDefinition } from './contexts/FormDefinitionContext';

// Component to initialize default form
function FormInitializer({ children }: { children: React.ReactNode }) {
  const { createFormDefinition } = useFormDefinition();
  
  React.useEffect(() => {
    // Create a default form definition
    createFormDefinition({
      title: "Sample Form",
      version: "1.0",
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<form_definition>
  <form_metadata>
    <title>Sample Form</title>
    <version>1.0</version>
  </form_metadata>
  <sections>
    <section id="section1">
      <title>Basic Information</title>
      <fields>
        <field id="name">
          <label>Name</label>
          <type>text</type>
          <validation>
            <required>true</required>
          </validation>
        </field>
        <field id="age">
          <label>Age</label>
          <type>number</type>
          <validation>
            <required>true</required>
            <min>0</min>
            <max>150</max>
          </validation>
        </field>
      </fields>
    </section>
  </sections>
</form_definition>`
    });
  }, [createFormDefinition]);

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/forms/:id" component={FormViewer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FormDefinitionProvider>
        <FormDataProvider>
          <FormInitializer>
            <Router />
            <Toaster />
          </FormInitializer>
        </FormDataProvider>
      </FormDefinitionProvider>
    </QueryClientProvider>
  );
}

export default App;