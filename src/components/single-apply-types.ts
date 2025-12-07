import type {
  ApplicationData,
  ApplicationEducation,
  ApplicationPhone,
  ApplicationProgramChoice,
  ApplicationStoredDocument,
} from '@app/types/application-data';

type FilePicked = {
  name: string;
  publicUrl: string;
};

export interface SingleApplyValues {
  email: string;
  data: ApplicationData;
  programChoices: ApplicationProgramChoice[];
  phones: ApplicationPhone[];
  educations: ApplicationEducation[];
  documents: (ApplicationStoredDocument & { files?: FilePicked[] })[];
}
