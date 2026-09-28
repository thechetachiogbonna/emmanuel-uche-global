UPDATE "products"
SET "media" = CASE
  WHEN "img1" = "img2" THEN jsonb_build_array(
    jsonb_build_object('src', "img1", 'type', 'image')
  )
  ELSE jsonb_build_array(
    jsonb_build_object('src', "img1", 'type', 'image'),
    jsonb_build_object('src', "img2", 'type', 'image')
  )
END
WHERE "media" IS NULL OR "media" = '[]'::jsonb;

ALTER TABLE "products"
  DROP COLUMN IF EXISTS "img1",
  DROP COLUMN IF EXISTS "img2";