import moment from 'moment';

export const DATE_FORMAT = 'YYYY-MM-DD';

export const MAX_CANDIDATE_GCE_DATE = moment().subtract(6, 'years').toDate();

export const MAX_CANDIDATE_BIRTH_DATE = moment().subtract(17, 'years').toDate();
export const MIN_CANDIDATE_BIRTH_DATE = moment().subtract(25, 'years').toDate();
