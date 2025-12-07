import { DateInputComponent } from '@app/components/inputs/date';
import { SelectComponent } from '@app/components/inputs/select';
import { TextInputComponent } from '@app/components/inputs/text';
import type { SingleApplyValues } from '@app/components/single-apply-types';
import { FieldArray, useFormikContext } from 'formik';
import { Minus, Plus } from 'react-feather';
export { educationStepSchema } from '@app/components/single-apply-schemas';

export function educationStep({
  user,
}: {
  user?: { email?: string | null; name?: string | null };
}) {
  const { values } = useFormikContext<SingleApplyValues>();

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">
        Education
      </h2>
      <p className="opacity-70">
        List the schools and programs you have completed or are currently attending.
      </p>

      <FieldArray
        name="educations"
        render={(arrayHelpers) => (
          <div className="flex flex-col gap-4">
            {values.educations.map((education, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-4 md:grid-cols-2 border border-base-300 rounded-box p-4">
                <SelectComponent
                  label="Type"
                  name={`educations.${index}.type`}>
                  <option value="GCE_OL">GCE O/L</option>
                  <option value="PROBATOIRE">Probatoire</option>
                  <option value="GCE_AL">GCE A/L</option>
                  <option value="BAC">BAC</option>
                  <option value="BTS">BTS</option>
                  <option value="BACHELOR">Bachelor</option>
                  <option value="OTHER">Other</option>
                </SelectComponent>
                <TextInputComponent
                  label="School name"
                  name={`educations.${index}.schoolName`}
                />
                <TextInputComponent
                  label="City"
                  name={`educations.${index}.city`}
                />
                <TextInputComponent
                  label="Country"
                  name={`educations.${index}.country`}
                />
                <TextInputComponent
                  label="Field of study"
                  name={`educations.${index}.fieldOfStudy`}
                />
                <SelectComponent
                  label="Status"
                  name={`educations.${index}.status`}>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="COMPLETED">Completed</option>
                </SelectComponent>
                <TextInputComponent
                  label="Candidate number"
                  name={`educations.${index}.candidateNumber`}
                />
                <TextInputComponent
                  label="Session year"
                  name={`educations.${index}.sessionYear`}
                  type="number"
                />
                <DateInputComponent
                  label="Start date"
                  name={`educations.${index}.startDate`}
                />
                <DateInputComponent
                  label="End date"
                  name={`educations.${index}.endDate`}
                />
                <DateInputComponent
                  label="Completion date"
                  name={`educations.${index}.completionDate`}
                />
                <TextInputComponent
                  label="GPA / Grade"
                  name={`educations.${index}.gpa`}
                />
                <button
                  type="button"
                  className="btn btn-soft btn-error btn-sm md:col-span-2"
                  onClick={() => arrayHelpers.remove(index)}>
                  <Minus />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-soft btn-primary self-start"
              onClick={() =>
                arrayHelpers.push({
                  type: 'GCE_OL',
                  schoolName: '',
                  city: '',
                  country: '',
                  fieldOfStudy: '',
                  status: 'IN_PROGRESS',
                })
              }>
              <Plus />
              Add education
            </button>
          </div>
        )}
      />
    </section>
  );
}
