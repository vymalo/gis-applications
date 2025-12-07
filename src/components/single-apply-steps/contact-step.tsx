import { SelectComponent } from '@app/components/inputs/select';
import { TextInputComponent } from '@app/components/inputs/text';
import { TextareaInputComponent } from '@app/components/inputs/textarea';
import { ToggleInputComponent } from '@app/components/inputs/toggle';
import type { SingleApplyValues } from '@app/components/single-apply-types';
import { FieldArray, useFormikContext } from 'formik';
import { Minus, Plus } from 'react-feather';
export { contactStepSchema } from '@app/components/single-apply-schemas';

export function contactStep({
  user,
}: {
  user?: { email?: string | null; name?: string | null };
}) {
  const { values } = useFormikContext<SingleApplyValues>();

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">
        How can we reach you?
      </h2>
      <p className="opacity-70">
        Add at least one phone number and tell us where you are.
      </p>

      <div className="flex flex-col gap-4">
        <div className="label">
          <span className="label-text text-base-content">
            Phone numbers
          </span>
        </div>

        <FieldArray
          name="phones"
          render={(arrayHelpers) => (
            <div className="flex flex-col gap-4">
              {values.phones.map((phoneNumber, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2 border border-base-300 rounded-box p-4">
                  <TextInputComponent
                    label="Number (without +237)"
                    name={`phones.${index}.phoneNumber`}
                  />
                  <SelectComponent
                    label="Kind"
                    name={`phones.${index}.kind`}>
                    <option value="PRIMARY">Primary</option>
                    <option value="SECONDARY">Secondary</option>
                    <option value="GUARDIAN">Guardian</option>
                    <option value="OTHER">Other</option>
                  </SelectComponent>
                  <ToggleInputComponent
                    label="Whatsapp call?"
                    name={`phones.${index}.whatsappCall`}
                  />
                  <ToggleInputComponent
                    label="Normal call?"
                    name={`phones.${index}.normalCall`}
                  />
                  <button
                    className="btn btn-soft btn-error btn-circle md:col-span-2"
                    type="button"
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
                    phoneNumber: '',
                    whatsappCall: false,
                    normalCall: false,
                    kind: 'SECONDARY',
                  })
                }>
                <span>Add a phone number</span>
                <Plus />
              </button>
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SelectComponent label="Country" name="data.country">
          <option value="cameroon">Cameroon</option>
        </SelectComponent>
        <TextInputComponent label="City / Town" name="data.city" />
      </div>

      <TextareaInputComponent
        label="Where are you?"
        name="data.whereAreYou"
        placeholder="You can add details about where you are"
        rows={4}
      />
    </section>
  );
}
