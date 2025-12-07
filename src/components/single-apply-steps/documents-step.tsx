import { FileInputComponent } from '@app/components/inputs/file-input';
import { SelectComponent } from '@app/components/inputs/select';
import { TextInputComponent } from '@app/components/inputs/text';
import type { SingleApplyValues } from '@app/components/single-apply-types';
import { FieldArray, useFormikContext } from 'formik';
import { Minus, Plus } from 'react-feather';
export { documentsStepSchema } from '@app/components/single-apply-schemas';

export function documentsStep({
  user,
}: {
  user?: { email?: string | null; name?: string | null };
}) {
  const { values } = useFormikContext<SingleApplyValues>();

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">
        Documents
      </h2>
      <p className="opacity-70">
        Upload scans or photos of your documents. You can always come back and add more.
      </p>

      <FieldArray
        name="documents"
        render={(arrayHelpers) => (
          <div className="flex flex-col gap-4">
            {values.documents.map((doc, index) => (
              <div
                key={index}
                className="card card-border bg-base-200/50 flex flex-col">
                <div className="card-body">
                  <SelectComponent
                    label="Kind"
                    name={`documents.${index}.kind`}>
                    <option value="ID">ID</option>
                    <option value="GCE_OL_CERT">GCE O/L</option>
                    <option value="PROBATOIRE_CERT">Probatoire</option>
                    <option value="GCE_AL_CERT">GCE A/L</option>
                    <option value="BAC_CERT">BAC</option>
                    <option value="UNIVERSITY_CERT">
                      University cert
                    </option>
                    <option value="RECOMMENDATION">
                      Recommendation
                    </option>
                    <option value="MOTIVATION">Motivation</option>
                    <option value="CV">CV</option>
                    <option value="TRANSCRIPT">Transcript</option>
                    <option value="OTHER">Other</option>
                  </SelectComponent>
                  <SelectComponent
                    label="Linked education"
                    name={`documents.${index}.educationId`}>
                    <option value="">Unlinked</option>
                    {values.educations.map((edu, eduIndex) => (
                      <option
                        key={eduIndex}
                        value={edu.id ?? `idx-${eduIndex}`}>
                        {edu.schoolName ||
                          `Education ${eduIndex + 1}`}
                      </option>
                    ))}
                  </SelectComponent>
                  <FileInputComponent
                    label="Upload document"
                    name={`documents.${index}.files`}
                    accept="image/*,application/pdf"
                    max={10}
                    multiple
                  />

                  <div className="card-actions justify-end">
                    <button
                      type="button"
                      className="btn btn-soft btn-error btn-sm md:col-span-2"
                      onClick={() => arrayHelpers.remove(index)}>
                      <Minus />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-soft btn-primary self-start"
              onClick={() =>
                arrayHelpers.push({
                  kind: 'ID',
                  publicUrl: '',
                  educationId: '',
                  files: [],
                })
              }>
              <Plus />
              Add document
            </button>
          </div>
        )}
      />
    </section>
  );
}
