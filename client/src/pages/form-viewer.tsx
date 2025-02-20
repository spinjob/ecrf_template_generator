import React from 'react';
import { parseECRFXml } from '@/lib/xml-parser';
import FormRenderer from '@/components/form-builder/FormRenderer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// The default form XML
const defaultFormXml = `<?xml version="1.0" encoding="UTF-8"?>
<ecrf_form id="thunder_clinical_trial" version="1.0">
    <form_metadata>
        <title>THUNDER Clinical Trial eCRF</title>
        <description>Electronic Case Report Form for the Treatment of High-Risk Prostate Cancer (THUNDER) Trial</description>
        <version>1.0</version>
        <last_modified>2025-02-20</last_modified>
    </form_metadata>

    <form_section id="demographics">
        <section_title>Demographic Information</section_title>
        <section_description>Basic patient demographic data</section_description>
        
        <input_field>
            <field_id>subject_id</field_id>
            <label>Subject ID</label>
            <type>text</type>
            <required>true</required>
            <validation>
                <pattern>[A-Z]{2}[0-9]{6}</pattern>
                <error_message>Subject ID must be 2 letters followed by 6 numbers</error_message>
            </validation>
        </input_field>

        <input_field>
            <field_id>year_of_birth</field_id>
            <label>Year of Birth</label>
            <type>number</type>
            <required>true</required>
            <validation>
                <min>1900</min>
                <max>2025</max>
            </validation>
        </input_field>

        <input_field>
            <field_id>race</field_id>
            <label>Race</label>
            <type>select</type>
            <required>false</required>
            <options>
                <option value="white">White</option>
                <option value="black">Black or African American</option>
                <option value="asian">Asian</option>
                <option value="hispanic">Hispanic or Latino</option>
                <option value="other">Other</option>
            </options>
        </input_field>
    </form_section>

    <form_section id="medical_history">
        <section_title>Medical History</section_title>
        <section_description>Relevant past medical conditions</section_description>

        <input_field>
            <field_id>prior_treatment</field_id>
            <label>Prior Prostate Cancer Treatment</label>
            <type>checkbox</type>
            <required>false</required>
            <options>
                <option value="radiotherapy">Radiotherapy</option>
                <option value="chemotherapy">Chemotherapy</option>
                <option value="hormone_therapy">Hormone Therapy</option>
                <option value="surgery">Surgery</option>
                <option value="none">None</option>
            </options>
        </input_field>

        <input_field>
            <field_id>pre_existing_conditions</field_id>
            <label>Pre-existing Conditions</label>
            <type>checkbox</type>
            <required>false</required>
            <options>
                <option value="htn">Hypertension</option>
                <option value="dm">Diabetes</option>
                <option value="cad">Coronary Artery Disease</option>
                <option value="renal">Chronic Kidney Disease</option>
                <option value="none">None</option>
            </options>
        </input_field>
    </form_section>

    <form_section id="vital_signs">
        <section_title>Vital Signs</section_title>
        <section_description>Record patient's vital signs at each visit</section_description>

        <input_field>
            <field_id>weight</field_id>
            <label>Weight (kg)</label>
            <type>number</type>
            <required>true</required>
            <validation>
                <min>40</min>
                <max>200</max>
                <decimal_places>1</decimal_places>
            </validation>
        </input_field>

        <input_field>
            <field_id>blood_pressure</field_id>
            <label>Blood Pressure (mmHg)</label>
            <type>composite</type>
            <required>true</required>
            <components>
                <component>
                    <field_id>systolic</field_id>
                    <label>Systolic</label>
                    <type>number</type>
                    <validation>
                        <min>90</min>
                        <max>220</max>
                    </validation>
                </component>
                <component>
                    <field_id>diastolic</field_id>
                    <label>Diastolic</label>
                    <type>number</type>
                    <validation>
                        <min>50</min>
                        <max>120</max>
                    </validation>
                </component>
            </components>
        </input_field>
    </form_section>

    <form_section id="laboratory_tests">
        <section_title>Laboratory Assessments</section_title>
        <section_description>Hematology and Biochemistry Tests</section_description>

        <input_field>
            <field_id>psa_level</field_id>
            <label>PSA Level (ng/mL)</label>
            <type>number</type>
            <required>true</required>
            <validation>
                <min>0</min>
                <max>100</max>
                <decimal_places>2</decimal_places>
            </validation>
        </input_field>

        <input_field>
            <field_id>creatinine</field_id>
            <label>Serum Creatinine (mg/dL)</label>
            <type>number</type>
            <required>true</required>
            <validation>
                <min>0.1</min>
                <max>10.0</max>
                <decimal_places>2</decimal_places>
            </validation>
        </input_field>

        <input_field>
            <field_id>hemoglobin</field_id>
            <label>Hemoglobin (g/dL)</label>
            <type>number</type>
            <required>true</required>
            <validation>
                <min>5</min>
                <max>20</max>
                <decimal_places>1</decimal_places>
            </validation>
        </input_field>
    </form_section>

    <form_section id="study_completion">
        <section_title>Form Completion</section_title>
        <section_description>Completion status and Investigator notes</section_description>

        <input_field>
            <field_id>completion_date</field_id>
            <label>Date of Completion</label>
            <type>datetime</type>
            <required>true</required>
            <default_value>current_timestamp</default_value>
        </input_field>

        <input_field>
            <field_id>investigator_notes</field_id>
            <label>Investigator Notes</label>
            <type>textarea</type>
            <required>false</required>
            <validation>
                <max_length>2000</max_length>
            </validation>
        </input_field>

        <input_field>
            <field_id>investigator_signature</field_id>
            <label>Investigator Signature</label>
            <type>signature</type>
            <required>true</required>
        </input_field>
    </form_section>
</ecrf_form>`;

export default function FormViewer() {
  const [xmlInput, setXmlInput] = React.useState(defaultFormXml);
  const [isEditing, setIsEditing] = React.useState(true);
  const { toast } = useToast();

  const handleRenderForm = () => {
    try {
      parseECRFXml(xmlInput);
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid XML format. Please check your input.",
        variant: "destructive",
      });
    }
  };

  if (isEditing) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">XML Form Editor</h1>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setXmlInput(defaultFormXml)}
            >
              Load Example
            </Button>
            <Button onClick={handleRenderForm}>
              Render Form
            </Button>
          </div>
        </div>
        <Textarea
          value={xmlInput}
          onChange={(e) => setXmlInput(e.target.value)}
          className="min-h-[600px] font-mono"
          placeholder="Paste your XML form definition here..."
        />
      </div>
    );
  }

  const parsedForm = parseECRFXml(xmlInput);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(true)}
        >
          Edit XML
        </Button>
      </div>
      <FormRenderer
        title={parsedForm.title}
        formDefinition={parsedForm}
        formId={1}
      />
    </div>
  );
}
