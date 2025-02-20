import { pgTable, text, serial, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const formDefinitions = pgTable("form_definitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  version: text("version").notNull(),
  xmlContent: text("xml_content").notNull(),
});

export const formData = pgTable("form_data", {
  id: serial("id").primaryKey(),
  formDefinitionId: integer("form_definition_id").references(() => formDefinitions.id),
  subjectId: text("subject_id").notNull(),
  sectionId: text("section_id").notNull(),
  data: jsonb("data").notNull(),
  isDraft: boolean("is_draft").default(true).notNull(),
  lastUpdated: text("last_updated").notNull(),
});

export const insertFormDefinitionSchema = createInsertSchema(formDefinitions);
export const insertFormDataSchema = createInsertSchema(formData);

export type FormDefinition = typeof formDefinitions.$inferSelect;
export type InsertFormDefinition = z.infer<typeof insertFormDefinitionSchema>;
export type FormData = typeof formData.$inferSelect;
export type InsertFormData = z.infer<typeof insertFormDataSchema>;

export const formDataValidationSchema = z.object({
  subjectId: z.string().min(1),
  sectionId: z.string().min(1),
  data: z.record(z.unknown()),
  isDraft: z.boolean(),
});