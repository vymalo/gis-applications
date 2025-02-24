import { useUploadFile } from "@app/hooks/upload-file";
import { useField } from "formik";
import React, { useCallback, useId } from "react";

import { useImperativeFilePicker } from "use-file-picker";
import {
  FileAmountLimitValidator,
  FileSizeValidator,
} from "use-file-picker/validators";
import { UploadCloud, X } from "react-feather";

interface FilePicked {
  publicUrl: string;
  name: string;
}

export function FileInputComponent({
  label,
  ...props
}: React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label: string;
  name: string;
}) {
  const id = useId();
  const [field, { touched, error, value }, { setValue }] =
    useField<FilePicked[]>(props);
  const {
    mutate,
    link: { isPending },
  } = useUploadFile();

  const { openFilePicker, errors, loading, removeFileByIndex } =
    useImperativeFilePicker({
      readAs: "DataURL",
      accept: props.accept,
      multiple: props.multiple,
      validators: [
        new FileAmountLimitValidator({ max: Number(props.max ?? 10) }),
        new FileSizeValidator({ maxFileSize: 50 * 1024 * 1024 /* 50 MB */ }),
      ],
      onFilesSuccessfullySelected: async ({ plainFiles }) => {
        const files = plainFiles.map((file) =>
          mutate(file).then(
            ({ publicUrl }) => ({ publicUrl, name: file.name }) as FilePicked,
          ),
        );

        await setValue(await Promise.all(files));
      },
    });

  const removeOne = useCallback(
    async (idx: number) => {
      removeFileByIndex(idx);
      await setValue(value?.filter((_, index) => index !== idx));
    },
    [removeFileByIndex, setValue, value],
  );

  const showLoading = loading || isPending;

  return (
    <label className="form-control w-full">
      <label htmlFor={id} className="label">
        <span className="label-text">{label ?? field.name}</span>
      </label>

      <div className="pt-2">
        <button
          type="button"
          className="btn btn-primary btn-outline"
          id={id}
          onClick={() => openFilePicker()}
        >
          Select files
        </button>

        <div className="list">
          {(value ?? []).map((file, index) => (
            <div
              className="list-row flex flex-row items-center gap-4"
              key={index}
            >
              <div className="text-primary">
                <UploadCloud />
              </div>

              <div>
                <h2 className="line-clamp-2 tracking-wide">{file.name}</h2>
                <p className="line-clamp-1 opacity-50">{file.publicUrl}</p>
              </div>

              <button
                type="button"
                className="btn btn-soft btn-error btn-circle ml-auto"
                onClick={() => removeOne(index)}
              >
                <X />
              </button>
            </div>
          ))}

          {errors.map(({ name }) => (
            <div key={name} className="list-row">
              <span className="text-error">{name}</span>
            </div>
          ))}

          {showLoading && <span className="loading loading-lg" />}
        </div>
      </div>

      {touched && error && (
        <div className="label">
          <span className="label-text-alt text-error">{error}</span>
        </div>
      )}
    </label>
  );
}
