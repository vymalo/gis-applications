import { DATE_FORMAT } from '@app/components/inputs/utils';
import type { SingleApplyValues } from '@app/components/single-apply-types';
import { useFormikContext } from 'formik';
import moment from 'moment';
export { fullSchema as reviewStepSchema } from '@app/components/single-apply-schemas';

export function reviewStep({
  user,
}: {
  user?: { email?: string | null; name?: string | null };
}) {
  const { values } = useFormikContext<SingleApplyValues>();

  const formatDate = (value?: string | Date) => {
    if (!value) {
      return 'N/A';
    }
    const m = moment(value);
    return m.isValid() ? m.format(DATE_FORMAT) : 'N/A';
  };

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">
        Review your application
      </h2>
      <p className="opacity-70">
        Make sure everything looks correct before you submit.
      </p>

      <div className="space-y-6">
        <div className="card card-border bg-base-200/60">
          <div className="card-body gap-3">
            <h3 className="font-semibold text-lg">Basics</h3>
            <p className="font-medium">
              {values.data.firstName} {values.data.lastName}
            </p>
            <p className="text-sm opacity-80">{values.email}</p>
            <p className="text-sm opacity-80">
              Birth date: {formatDate(values.data.birthDate as any)}
            </p>
          </div>
        </div>

        <div className="card card-border bg-base-200/60">
          <div className="card-body gap-3">
            <h3 className="font-semibold text-lg">About you</h3>
            <p className="whitespace-pre-line opacity-90">
              {values.data.whoAreYou || 'No description provided.'}
            </p>
          </div>
        </div>

        <div className="card card-border bg-base-200/60">
          <div className="card-body gap-3">
            <h3 className="font-semibold text-lg">Contact</h3>
            <p className="font-medium">
              {values.data.city || 'N/A'}, {values.data.country || 'N/A'}
            </p>
            <div className="divider my-1" />
            <div className="space-y-2">
              {values.phones.map((phone, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="font-medium">{phone.phoneNumber}</div>
                  <div className="opacity-80">
                    {phone.kind ?? 'PRIMARY'}
                    {phone.whatsappCall ? ' • WhatsApp' : ''}
                    {phone.normalCall ? ' • Call' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card card-border bg-base-200/60">
          <div className="card-body gap-3">
            <h3 className="font-semibold text-lg">Education</h3>
            <div className="space-y-2">
              {values.educations.map((edu, index) => (
                <div key={index} className="rounded-box border border-base-300 p-3">
                  <p className="font-semibold">{edu.schoolName || 'School'}</p>
                  <p className="text-sm opacity-80">
                    {edu.type} • {edu.status ?? 'IN_PROGRESS'}
                  </p>
                  <p className="text-sm opacity-80">
                    {edu.city || 'City'}, {edu.country || 'Country'}
                  </p>
                  <p className="text-xs opacity-70">
                    Start: {formatDate(edu.startDate as any)} | End: {formatDate(edu.endDate as any)} | Completion: {formatDate(edu.completionDate as any)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card card-border bg-base-200/60">
          <div className="card-body gap-3">
            <h3 className="font-semibold text-lg">Documents</h3>
            <div className="space-y-2">
              {values.documents.length === 0 && (
                <p className="text-sm opacity-80">No documents uploaded yet.</p>
              )}
              {values.documents.map((doc, index) => (
                <div key={index} className="rounded-box border border-base-300 p-3 text-sm">
                  <p className="font-semibold">{doc.name || doc.kind}</p>
                  <p className="opacity-80">{doc.kind}</p>
                  <p className="opacity-80 break-all">
                    {doc.publicUrl || doc.files?.[0]?.publicUrl || 'Pending upload'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
