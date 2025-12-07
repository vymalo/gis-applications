ALTER TABLE "application"
  DROP COLUMN IF EXISTS "phone_numbers",
  DROP COLUMN IF EXISTS "has_id_cart_or_passport",
  DROP COLUMN IF EXISTS "id_cart_or_passport_or_receipt",
  DROP COLUMN IF EXISTS "high_school_over",
  DROP COLUMN IF EXISTS "high_school_gce_ol_probatoir_date",
  DROP COLUMN IF EXISTS "high_school_gce_ol_probatoire_certificates",
  DROP COLUMN IF EXISTS "high_school_gce_al_bac_date",
  DROP COLUMN IF EXISTS "high_school_gce_al_bac_certificates",
  DROP COLUMN IF EXISTS "university_student",
  DROP COLUMN IF EXISTS "university_start_date",
  DROP COLUMN IF EXISTS "university_end_date",
  DROP COLUMN IF EXISTS "university_certificates";
