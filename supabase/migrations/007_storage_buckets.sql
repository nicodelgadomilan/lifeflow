-- Ejecutar en Supabase SQL Editor
-- Crea el bucket para documentos del usuario (2 buckets: uno general, uno vehicular)

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-docs', 'vehicle-docs', true)
ON CONFLICT DO NOTHING;

-- Políticas de acceso: cada usuario solo puede leer/escribir sus propios archivos
-- Bucket: documents
CREATE POLICY "Users upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Bucket: vehicle-docs
CREATE POLICY "Users upload own vehicle docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vehicle-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own vehicle docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own vehicle docs"
ON storage.objects FOR DELETE
USING (bucket_id = 'vehicle-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
