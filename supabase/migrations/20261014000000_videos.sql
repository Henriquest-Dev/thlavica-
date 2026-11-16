-- O balde `site` passa a aceitar também vídeos (MP4 e WebM), até 50 MB por ficheiro (o máximo do plano gratuito).
-- Pode ser executado mais de uma vez. Quem envia continua a ser só o administrador (regras do 20261009).
update storage.buckets
   set file_size_limit = 52428800,
       allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png', 'video/mp4', 'video/webm']
 where id = 'site';
