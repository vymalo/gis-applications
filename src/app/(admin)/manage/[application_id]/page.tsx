export default async function SingleApplication({
  params,
}: {
  params: Promise<{ application_id: string }>;
}) {
  const { application_id } = await params;
  return (
    <div>
      <h1>Application</h1>
      <p>Application ID: {application_id}</p>
    </div>
  );
}
