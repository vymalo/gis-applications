import { useField } from 'formik';
import React from 'react';
import { Search } from 'react-feather';
import { twMerge } from 'tailwind-merge';

export function SearchInputComponent({
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
  const [field, {}, {}] = useField(props);
  return (
    <label className='input w-full'>
      <span className='opacity-50'>{label ?? field.name}</span>
      <input
        {...field}
        {...props}
        type={props.type ?? 'search'}
        placeholder={props.placeholder}
        className={twMerge('w-full', props.className)}
      />
      <Search className='opacity-50' />
    </label>
  );
}
