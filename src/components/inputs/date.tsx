'use client';

import { DATE_FORMAT } from '@app/components/inputs/utils';
import { useField } from 'formik';
import moment from 'moment';
import Pikaday from 'pikaday';
import React, { useEffect, useMemo, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

export function DateInputComponent({
  label,
  defaultDate,
  maxDate,
  minDate,
  ...props
}: Omit<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  'defaultChecked' | 'defaultValue'
> & {
  label?: string;
  name: string;
} & Partial<
    Pick<Pikaday.PikadayOptions, 'maxDate' | 'minDate' | 'defaultDate'>
  >) {
  const [{ value: v, ...restField }, { touched, error }, { setValue }] =
    useField(props);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof v === 'string') {
      setValue(moment(v).toDate());
    }
  }, [setValue, v]);

  useEffect(() => {
    const picker = new Pikaday({
      field: ref.current,
      maxDate: maxDate,
      minDate: minDate,
      format: DATE_FORMAT,
      defaultDate: defaultDate,
      setDefaultDate: true,
      onSelect: (date: Date) => {
        const value = moment(date).format(DATE_FORMAT);
        setValue(moment(value).toDate());
      },
    });
    return () => {
      picker?.destroy?.();
    };
  }, [defaultDate, maxDate, minDate, setValue]);

  const value = useMemo(() => moment(v).format(DATE_FORMAT), [v]);

  return (
    <label className='form-control w-full'>
      <div className='label'>
        <span className='label-text opacity-60 tracking-tight text-base-content'>
          {label ?? restField.name}
        </span>
      </div>
      <input
        type='text'
        {...restField}
        {...props}
        value={value}
        className={twMerge(
          'input pika-single input-bordered w-full',
          props.className,
        )}
        ref={ref}
      />
      {touched && error && (
        <div className='label'>
          <span className='label-text-alt text-error'>{error}</span>
        </div>
      )}
    </label>
  );
}
