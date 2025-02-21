import React from 'react';
import { parseECRFXml } from '@/lib/xml-parser';
import FormRenderer from '@/components/form-builder/FormRenderer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { CopyIcon, CheckIcon, InfoCircledIcon, FileIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const promptText = `<meta prompt 1 = "ecrf format">
<meta_prompt>
You will respond with 1 XML Section representing the electronic Case Report Form generated from the user instructions.

Here are some notes on how you should respond in the XML section:
- Respond with the XML and nothing else.
- Avoid special characters.  If you must, PROPERLY ESCAPE THEM (e.g.  &amp;)
- I am going to copy/paste that entire XML section into a parser to automatically apply the chnages you made, so put the XML code block inside a markdown codeblock.

Here is an example of the XML format with demo data:

<ecrf_form id="patient_enrollment" version="1.0">
    <form_metadata>
        <title>{{PROTOCOL_FORM_NAME}}</title>
        <description>{{{{PROTOCOL_FORM_DESCRIPTION}}</description>
        <version>1.0</version>
        <last_modified>2025-02-20</last_modified>
    </form_metadata>

    <form_section id="demographic_section">
        <section_title>Demographic Information</section_title>
        <section_description>Basic patient demographic data</section_description>
        
        <input_field>
            <field_id>patient_id</field_id>
            <label>Patient ID</label>
            <type>text</type>
            <required>true</required>
            <validation>
                <pattern>[A-Z]{2}[0-9]{6}</pattern>
                <error_message>Patient ID must be 2 letters followed by 6 numbers</error_message>
            </validation>
        </input_field>

        <input_field>
            <field_id>dob</field_id>
            <label>Date of Birth</label>
            <type>date</type>
            <required>true</required>
            <validation>
                <min_date>1900-01-01</min_date>
                <max_date>2025-02-20</max_date>
            </validation>
        </input_field>

        <input_field>
            <field_id>gender</field_id>
            <label>Gender</label>
            <type>radio</type>
            <required>true</required>
            <options>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
                <option value="P">Prefer not to say</option>
            </options>
        </input_field>
    </form_section>

    <form_section id="vital_signs">
        <section_title>Vital Signs</section_title>
        <section_description>Current vital measurements</section_description>

        <input_field>
            <field_id>weight</field_id>
            <label>Weight (kg)</label>
            <type>number</type>
            <required>true</required>
            <validation>
                <min>0</min>
                <max>500</max>
                <decimal_places>1</decimal_places>
            </validation>
        </input_field>

        <input_field>
            <field_id>blood_pressure</field_id>
            <label>Blood Pressure</label>
            <type>composite</type>
            <required>true</required>
            <components>
                <component>
                    <field_id>systolic</field_id>
                    <label>Systolic</label>
                    <type>number</type>
                    <validation>
                        <min>60</min>
                        <max>250</max>
                    </validation>
                </component>
                <component>
                    <field_id>diastolic</field_id>
                    <label>Diastolic</label>
                    <type>number</type>
                    <validation>
                        <min>40</min>
                        <max>150</max>
                    </validation>
                </component>
            </components>
        </input_field>
    </form_section>

    <form_section id="medical_history">
        <section_title>Medical History</section_title>
        <section_description>Previous medical conditions and current medications</section_description>

        <input_field>
            <field_id>conditions</field_id>
            <label>Pre-existing Conditions</label>
            <type>checkbox</type>
            <required>false</required>
            <options>
                <option value="HTN">Hypertension</option>
                <option value="DM">Diabetes</option>
                <option value="CAD">Coronary Artery Disease</option>
                <option value="COPD">COPD</option>
            </options>
        </input_field>

        <input_field>
            <field_id>medications</field_id>
            <label>Current Medications</label>
            <type>table</type>
            <required>false</required>
            <columns>
                <column>
                    <field_id>med_name</field_id>
                    <label>Medication Name</label>
                    <type>text</type>
                </column>
                <column>
                    <field_id>dosage</field_id>
                    <label>Dosage</label>
                    <type>text</type>
                </column>
                <column>
                    <field_id>frequency</field_id>
                    <label>Frequency</label>
                    <type>select</type>
                    <options>
                        <option value="QD">Once daily</option>
                        <option value="BID">Twice daily</option>
                        <option value="TID">Three times daily</option>
                        <option value="QID">Four times daily</option>
                    </options>
                </column>
            </columns>
        </input_field>
    </form_section>

    <form_section id="study_completion">
        <section_title>Form Completion</section_title>
        <section_description>Administrative information about form completion</section_description>

        <input_field>
            <field_id>completion_date</field_id>
            <label>Date of Completion</label>
            <type>datetime</type>
            <required>true</required>
            <default_value>current_timestamp</default_value>
        </input_field>

        <input_field>
            <field_id>investigator_notes</field_id>
            <label>Additional Notes</label>
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
</ecrf_form>


So, the XML section will be:

xml
__XML HERE__

</meta_prompt>
</meta prompt 1>
<xml_formatting_instructions>
### Role
- You are a **xml form building assistant**: You can fulfill XML generation requests. Ensure the XML you generate uses the information provided about the Protocol and formats the XML according to the provided structure. It must be valid and escape characters that break XML validation.

Avoid placeholders like ... or // existing code here. Provide complete lines or code.

## Final Notes
1.  Wrap your final output in 
XML ...
 for clarity.
2. The final output must apply cleanly with no leftover syntax errors.
</xml_formatting_instructions><user_instructions>
Based on the provided protocol, create a comprehensive set of eCRF forms for all events listed. 

For repeating events, like treatment and follow-ups, please only create a single re-usable set of forms. The output should be every single form clinically required to conduct a CRF process and be agnostic of international borders. 

Return the  result in a format which is usable and legible immediately with copy and paste. Streamline the format to plain text or a markdown table, ensuring the ChatGPT Code Interpreter can effectively replicate the desired result without confusion.

Be extremely thorough. If a form question is asking what type of Hematology test was conducted, please provide all of the most common tests as answers. If the 'EPIC' questionnaire is required, include high level section scores as the input into the document. 

The forms must comply with GDPR. 

The patient's name, birth date, etc. should not be used. Instead, refer to the subject ID and sequence IDs of given events. 

Use logic to consider when a question should be free text or multiple choice. 

Use Section Numbers (i.e. 1.1.1) to denote and structure the entire document.

</user_instructions>`;

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
  const [isCopied, setIsCopied] = React.useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = React.useState(false);
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

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setIsCopied(true);
      toast({
        title: "Success",
        description: "Prompt copied to clipboard!",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      });
    }
  };

  if (isEditing) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <h1 className="text-3xl font-bold">eCRF Generator Prototype</h1>
        
        <Collapsible
          open={isInstructionsOpen}
          onOpenChange={setIsInstructionsOpen}
          className="w-full"
        >
          <Card className="border p-4">
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <InfoCircledIcon className="h-4 w-4" />
                <h2 className="text-xl font-semibold">Instructions</h2>
              </div>
              <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isInstructionsOpen ? 'transform rotate-180' : ''}`} />
            </CollapsibleTrigger>

            <CollapsibleContent className="pt-4">
              <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Open <a href="https://chat.openai.com" className="text-blue-600 hover:underline">chat.openai.com</a> and select the "o1" model</li>
                  <li>Add a PDF or other file that describes the Protocol you want to generate an eCRF for</li>
                  <li>Copy the prompt below and paste it into the chat</li>
                  <li>Once ChatGPT has returned the XML, copy the XML and paste it into the XML Form Editor below</li>
                  <li>Click the "Render Form" button to see the form</li>
                </ol>

                <div className="relative space-y-2 pt-4">
                  <div className="flex items-center space-x-2">
                    <FileIcon className="h-4 w-4" />
                    <h2 className="text-lg font-semibold">Prompt (copy and paste with protocol attached as file)</h2>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto relative">{promptText}</pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleCopyPrompt}
                  >
                    {isCopied ? (
                      <div className="flex items-center space-x-2">
                        <p className="text-xs">Copied!</p>
                        <CheckIcon className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <p className="text-xs">Copy Prompt</p>
                        <CopyIcon className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Card className="border-2">
          <div className="border-b p-4 bg-muted/30">
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-start space-y-2">
                <h2 className="text-xl font-semibold">XML Form Definition</h2>
                <p className="text-sm text-muted-foreground">Paste the ChatGPT generated XML form definition here...</p>
              </div>
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
          </div>
          <div className="p-4">
            <Textarea
              value={xmlInput}
              onChange={(e) => setXmlInput(e.target.value)}
              className="min-h-[600px] font-mono"
              placeholder="Paste your XML form definition here..."
            />
          </div>
        </Card>
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
