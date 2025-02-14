import { type Application } from "@prisma/client";

export type SingleApplyProps =
  | {
      application: null;
    }
  | {
      application: Application;
    };

export function SingleApply({ application }: SingleApplyProps) {
  return (
    <div>
      <h1>Single Apply</h1>
    </div>
  );
}
