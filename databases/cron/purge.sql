-- Purge comparisons older than 24 months for GDPR/CCPA compliance
-- This job should be scheduled via pg_cron or equivalent

-- Delete rows from 'public.comparisons' where created_at is older than 24 months
DELETE FROM public.comparisons
WHERE created_at < (NOW() - INTERVAL '24 months');

-- To schedule this job in pg_cron (example):
-- SELECT cron.schedule('purge_old_comparisons', '0 3 * * *', $$DELETE FROM public.comparisons WHERE created_at < (NOW() - INTERVAL ''24 months'');$$); 