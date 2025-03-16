import { SearchInputComponent } from '@app/components/inputs/search';
import { Form, Formik } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const Schema = z.object({
  q: z.string().optional(),
});

interface SearchFieldProps {
  onChange: (q: string) => void;
}

export function SearchField({ onChange }: SearchFieldProps) {
  return (
    <Formik<{ q: string }>
      initialValues={{ q: '' }}
      validationSchema={toFormikValidationSchema(Schema)}
      onSubmit={async (values, {}) => {
        onChange(values.q);
      }}>
      <Form>
        <SearchInputComponent label='Search' name='q' />
      </Form>
    </Formik>
  );
}
