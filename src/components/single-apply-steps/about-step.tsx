import { TextareaInputComponent } from '@app/components/inputs/textarea';
import type { SingleApplyValues } from '@app/components/single-apply-types';
import { useFormikContext } from 'formik';
export { aboutStepSchema } from '@app/components/single-apply-schemas';

export function aboutStep({
  user,
}: {
  user?: { email?: string | null; name?: string | null };
}) {
  useFormikContext<SingleApplyValues>();

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">
        Who are you?
      </h2>
      <p className="opacity-70">
        Share a short story about yourself, your background and your motivations.
      </p>
      <TextareaInputComponent
        label="Who are you?"
        name="data.whoAreYou"
        placeholder="Tell us more about you"
        rows={6}
      />
    </section>
  );
}
