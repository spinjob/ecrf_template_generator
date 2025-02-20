import React from 'react';

interface FormDefinition {
  id: number;
  title: string;
  version: string;
  xmlContent: string;
}

interface FormDefinitionContextType {
  formDefinitions: Map<number, FormDefinition>;
  createFormDefinition: (def: Omit<FormDefinition, 'id'>) => FormDefinition;
  getFormDefinition: (id: number) => FormDefinition | undefined;
}

const FormDefinitionContext = React.createContext<FormDefinitionContextType | undefined>(undefined);

let nextId = 1;

export function FormDefinitionProvider({ children }: { children: React.ReactNode }) {
  const [formDefinitions, setFormDefinitions] = React.useState<Map<number, FormDefinition>>(new Map());

  const createFormDefinition = React.useCallback((def: Omit<FormDefinition, 'id'>) => {
    const newDef: FormDefinition = {
      ...def,
      id: nextId++,
    };

    setFormDefinitions((prev) => {
      const newMap = new Map(prev);
      newMap.set(newDef.id, newDef);
      return newMap;
    });

    return newDef;
  }, []);

  const getFormDefinition = React.useCallback((id: number) => {
    return formDefinitions.get(id);
  }, [formDefinitions]);

  const value = React.useMemo(() => ({
    formDefinitions,
    createFormDefinition,
    getFormDefinition,
  }), [formDefinitions, createFormDefinition, getFormDefinition]);

  return (
    <FormDefinitionContext.Provider value={value}>
      {children}
    </FormDefinitionContext.Provider>
  );
}

export function useFormDefinition() {
  const context = React.useContext(FormDefinitionContext);
  if (context === undefined) {
    throw new Error('useFormDefinition must be used within a FormDefinitionProvider');
  }
  return context;
} 