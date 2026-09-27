ALTER TABLE "products"
ADD COLUMN IF NOT EXISTS "media" jsonb NOT NULL DEFAULT '[]'::jsonb;

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
WHERE "media" = '[]'::jsonb;