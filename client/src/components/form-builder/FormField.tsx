import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField as FormFieldType } from '@/lib/xml-parser';
import {
  FormControl,
  FormDescription,
  FormField as UIFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface FormFieldProps {
  field: FormFieldType;
}

export default function FormField({ field }: FormFieldProps) {
  const form = useFormContext();

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <FormControl>
            <Input
              {...form.register(field.id)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </FormControl>
        );

      case 'number':
      case 'decimal':
        return (
          <FormControl>
            <Input
              type="number"
              {...form.register(field.id, {
                valueAsNumber: true,
              })}
              step={field.validation?.decimalPlaces ? `0.${'0'.repeat(field.validation.decimalPlaces-1)}1` : '1'}
              min={field.validation?.min}
              max={field.validation?.max}
            />
          </FormControl>
        );

      case 'date':
        return (
          <FormControl>
            <Input
              type="date"
              {...form.register(field.id)}
              min={field.validation?.minDate}
              max={field.validation?.maxDate}
            />
          </FormControl>
        );

      case 'textarea':
        return (
          <FormControl>
            <Textarea
              {...form.register(field.id)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              maxLength={field.validation?.maxLength}
            />
          </FormControl>
        );

      case 'radio':
        return (
          <FormControl>
            <RadioGroup
              onValueChange={(value) => form.setValue(field.id, value)}
              defaultValue={form.getValues(field.id)}
            >
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                  <FormLabel htmlFor={`${field.id}-${option.value}`}>{option.label}</FormLabel>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControl>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option.value}`}
                    {...form.register(`${field.id}.${option.value}`)}
                  />
                  <FormLabel htmlFor={`${field.id}-${option.value}`}>{option.label}</FormLabel>
                </div>
              ))}
            </div>
          </FormControl>
        );

      case 'select':
        return (
          <FormControl>
            <Select
              onValueChange={(value) => form.setValue(field.id, value)}
              defaultValue={form.getValues(field.id)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        );

      case 'table':
        return (
          <FormControl>
            <Table>
              <TableHeader>
                <TableRow>
                  {field.columns?.map((column) => (
                    <TableHead key={column.id}>{column.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  {field.columns?.map((column) => (
                    <TableCell key={column.id}>
                      <FormField field={column} />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </FormControl>
        );

      case 'group':
        return (
          <FormControl>
            <div className="space-y-4 border p-4 rounded-lg">
              {field.groupFields?.map((groupField) => (
                <FormField key={groupField.id} field={groupField} />
              ))}
            </div>
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <UIFormField
      control={form.control}
      name={field.id}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>{field.label}</FormLabel>
          {renderField()}
          {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}