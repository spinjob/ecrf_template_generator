import React from 'react';

interface FormData {
  id: number;
  formDefinitionId: number;
  subjectId: string;
  sectionId: string;
  data: Record<string, unknown>;
  isDraft: boolean;
  lastUpdated: string;
}

interface FormDataContextType {
  formData: Map<string, FormData[]>;
  saveFormData: (data: Omit<FormData, 'id'>) => void;
  getFormData: (formDefId: number, subjectId: string) => FormData[];
}

const FormDataContext = React.createContext<FormDataContextType | undefined>(undefined);

let nextId = 1;

export function FormDataProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = React.useState<Map<string, FormData[]>>(new Map());

  const saveFormData = React.useCallback((data: Omit<FormData, 'id'>) => {
    const newData: FormData = {
      ...data,
      id: nextId++,
    };

    setFormData((prev) => {
      const key = `${data.formDefinitionId}-${data.subjectId}`;
      const newMap = new Map(prev);
      const existingData = newMap.get(key) || [];
      newMap.set(key, [...existingData, newData]);
      return newMap;
    });
  }, []);

  const getFormData = React.useCallback((formDefId: number, subjectId: string) => {
    const key = `${formDefId}-${subjectId}`;
    return formData.get(key) || [];
  }, [formData]);

  const value = React.useMemo(() => ({
    formData,
    saveFormData,
    getFormData,
  }), [formData, saveFormData, getFormData]);

  return (
    <FormDataContext.Provider value={value}>
      {children}
    </FormDataContext.Provider>
  );
}

export function useFormData() {
  const context = React.useContext(FormDataContext);
  if (context === undefined) {
    throw new Error('useFormData must be used within a FormDataProvider');
  }
  return context;
} 