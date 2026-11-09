-- JejakLapak: Bucket Supabase Storage untuk foto gerobak pedagang
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'merchant-photos',
    'merchant-photos',
    true,
    1048576,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "merchant_photos_public_read" ON storage.objects;
CREATE POLICY "merchant_photos_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'merchant-photos');

DROP POLICY IF EXISTS "merchant_photos_owner_insert" ON storage.objects;
CREATE POLICY "merchant_photos_owner_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'merchant-photos'
    AND (storage.foldername(name))[1] IN (
        SELECT m.id::text FROM public.merchants m WHERE m.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "merchant_photos_owner_update" ON storage.objects;
CREATE POLICY "merchant_photos_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'merchant-photos'
    AND (storage.foldername(name))[1] IN (
        SELECT m.id::text FROM public.merchants m WHERE m.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "merchant_photos_owner_delete" ON storage.objects;
CREATE POLICY "merchant_photos_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'merchant-photos'
    AND (storage.foldername(name))[1] IN (
        SELECT m.id::text FROM public.merchants m WHERE m.owner_id = auth.uid()
    )
);