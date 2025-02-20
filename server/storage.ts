import { 
  FormDefinition, InsertFormDefinition,
  FormData, InsertFormData
} from "@shared/schema";

export interface IStorage {
  // Form Definition operations
  getFormDefinition(id: number): Promise<FormDefinition | undefined>;
  createFormDefinition(def: InsertFormDefinition): Promise<FormDefinition>;

  // Form Data operations
  getFormData(formDefId: number, subjectId: string): Promise<FormData[]>;
  saveFormData(data: InsertFormData): Promise<FormData>;
  updateFormData(id: number, data: Partial<InsertFormData>): Promise<FormData>;
}

export class MemStorage implements IStorage {
  private formDefs: Map<number, FormDefinition>;
  private formData: Map<number, FormData>;
  private currentFormDefId: number;
  private currentFormDataId: number;

  constructor() {
    this.formDefs = new Map();
    this.formData = new Map();
    this.currentFormDefId = 1;
    this.currentFormDataId = 1;
  }

  async getFormDefinition(id: number): Promise<FormDefinition | undefined> {
    return this.formDefs.get(id);
  }

  async createFormDefinition(def: InsertFormDefinition): Promise<FormDefinition> {
    const id = this.currentFormDefId++;
    const formDef: FormDefinition = { id, ...def };
    this.formDefs.set(id, formDef);
    return formDef;
  }

  async getFormData(formDefId: number, subjectId: string): Promise<FormData[]> {
    return Array.from(this.formData.values()).filter(
      data => data.formDefinitionId === formDefId && data.subjectId === subjectId
    );
  }

  async saveFormData(data: InsertFormData): Promise<FormData> {
    const id = this.currentFormDataId++;
    const formData: FormData = {
      id,
      formDefinitionId: data.formDefinitionId || 0, // Provide default value
      subjectId: data.subjectId,
      sectionId: data.sectionId,
      data: data.data,
      isDraft: data.isDraft ?? true, // Provide default value
      lastUpdated: data.lastUpdated
    };
    this.formData.set(id, formData);
    return formData;
  }

  async updateFormData(id: number, data: Partial<InsertFormData>): Promise<FormData> {
    const existing = this.formData.get(id);
    if (!existing) {
      throw new Error('Form data not found');
    }
    const updated: FormData = {
      ...existing,
      ...data,
      id: existing.id // Ensure id doesn't get overwritten
    };
    this.formData.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();