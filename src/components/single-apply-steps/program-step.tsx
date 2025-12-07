import type { SingleApplyValues } from '@app/components/single-apply-types';
import { useFormikContext } from 'formik';
export { programStepSchema } from '@app/components/single-apply-schemas';

export function programStep({
  user,
}: {
  user?: { email?: string | null; name?: string | null };
}) {
  useFormikContext<SingleApplyValues>();

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">
        Your program
      </h2>
      <p className="opacity-70">
        You&apos;re applying for the GIS program. For now, the university
        offers only this one program option through this form, so there&apos;s
        nothing to choose here — just keep going to complete your application.
      </p>
      <div className="alert alert-info">
        <span>
          Remember: this application is only for the GIS program. If you had
          another program in mind, please check the university website for its
          dedicated application process.
        </span>
      </div>
    </section>
  );
}
