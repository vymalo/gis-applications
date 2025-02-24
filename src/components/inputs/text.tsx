import { useField } from 'formik';
import React from 'react';
import { twMerge } from 'tailwind-merge';

export function TextInputComponent({
  label,
  ...props
}: Omit<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  'defaultChecked' | 'defaultValue'
> & {
  label: string;
  name: string;
}) {
  const [field, { touched, error }, {}] = useField(props);
  return (
    <label className='form-control w-full'>
      <div className='label'>
        <span className='label-text'>{label ?? field.name}</span>
      </div>
      <input
        {...field}
        {...props}
        type={props.type ?? 'text'}
        className={twMerge('input input-bordered w-full', props.className)}
      />
      {touched && error && (
        <div className='label'>
          <span className='label-text-alt text-error'>{error}</span>
        </div>
      )}
    </label>
  );
}
