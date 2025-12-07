'use client';

import { DATE_FORMAT } from '@app/components/inputs/utils';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useField } from 'formik';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

type DateInputProps = {
  label?: string;
  name: string;
  maxDate?: Date;
  minDate?: Date;
  defaultDate?: Date;
  className?: string;
};

export function DateInputComponent({
  label,
  maxDate,
  minDate,
  defaultDate,
  className,
  ...props
}: DateInputProps) {
  const [{ value }, { touched, error }, { setValue }] = useField<Date | string | null>(props.name);
  const [displayMonth, setDisplayMonth] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!value && defaultDate) {
      setValue(defaultDate);
    }
  }, [defaultDate, setValue, value]);

  const selectedDate = useMemo(() => {
    if (!value) {
      return undefined;
    }
    if (value instanceof Date) {
      return value;
    }
    const parsed = moment(value, DATE_FORMAT, true);
    return parsed.isValid() ? parsed.toDate() : undefined;
  }, [value]);

  const handleSelect = (date?: Date) => {
    if (!date) {
      setValue(null);
      return;
    }
    setValue(date);
  };

  const disabled = [
    minDate ? { before: minDate } : undefined,
    maxDate ? { after: maxDate } : undefined,
  ].filter(Boolean) as any[];

  const displayValue = selectedDate
    ? moment(selectedDate).format(DATE_FORMAT)
    : 'Select a date';

  useEffect(() => {
    if (selectedDate) {
      setDisplayMonth(selectedDate);
    } else if (defaultDate) {
      setDisplayMonth(defaultDate);
    }
  }, [defaultDate, selectedDate]);

  return (
    <div className={twMerge('form-control w-full', className)}>
      <div className="label">
        <span className="label-text opacity-60 tracking-tight text-base-content">
          {label ?? props.name}
        </span>
      </div>

      <div className="rounded-box border border-base-300 bg-base-200/40 p-4 flex flex-col gap-4">
        <div className="text-lg font-medium">
          {displayValue}
        </div>
        <DayPicker
          mode="single"
          month={displayMonth}
          defaultMonth={displayMonth}
          onMonthChange={setDisplayMonth}
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={disabled}
          showOutsideDays
          captionLayout="dropdown"
          fromYear={minDate ? minDate.getFullYear() : undefined}
          toYear={maxDate ? maxDate.getFullYear() : undefined}
        />
      </div>

      {touched && error && (
        <div className="label">
          <span className="label-text-alt text-error">{error}</span>
        </div>
      )}
    </div>
  );
}
