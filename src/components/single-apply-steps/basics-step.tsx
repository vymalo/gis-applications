import { DateInputComponent } from '@app/components/inputs/date';
import { TextInputComponent } from '@app/components/inputs/text';
import {
  MAX_CANDIDATE_BIRTH_DATE,
  MIN_CANDIDATE_BIRTH_DATE,
} from '@app/components/inputs/utils';
import type { SingleApplyValues } from '@app/components/single-apply-types';
import { useFormikContext } from 'formik';
export { basicsStepSchema } from '@app/components/single-apply-schemas';

export function basicsStep({
  user,
}: {
  user?: { email?: string | null; name?: string | null };
}) {
  useFormikContext<SingleApplyValues>();

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">
        Let&apos;s start with the basics
      </h2>
      <p className="opacity-70">
        Tell us who you are and how we can reach you.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextInputComponent
          label="First name"
          name="data.firstName"
          autoComplete="given-name"
        />
        <TextInputComponent
          label="Last name"
          name="data.lastName"
          autoComplete="family-name"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextInputComponent
          label="Email"
          name="email"
          type="email"
          disabled={!!user}
        />
        <DateInputComponent
          label="Birth date"
          name="data.birthDate"
          maxDate={MAX_CANDIDATE_BIRTH_DATE}
          minDate={MIN_CANDIDATE_BIRTH_DATE}
          defaultDate={MAX_CANDIDATE_BIRTH_DATE}
        />
      </div>
    </section>
  );
}
