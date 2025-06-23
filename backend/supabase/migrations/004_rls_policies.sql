-- RLS Implementation for Core Tables
-- Version: 1.0
-- PRD Reference: Section 7.2 (Security Requirements)
-- Dependencies: 001-003 migrations must run first

-- Enable Row Level Security on core tables
ALTER TABLE prompt_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE spark_logs ENABLE ROW LEVEL SECURITY;

-- Explicit policies for all operations
CREATE POLICY user_access_policy_select ON prompt_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY user_access_policy_insert ON prompt_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY user_access_policy_update ON prompt_logs FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY user_access_policy_delete ON prompt_logs FOR DELETE USING (user_id = auth.uid());

-- Column-level security for sensitive fields
REVOKE ALL ON TABLE payment_logs FROM authenticated;
GRANT SELECT (id, user_id, status) ON payment_logs TO authenticated;

-- Performance optimization
CREATE INDEX IF NOT EXISTS idx_prompt_logs_user_created ON prompt_logs(user_id, created_at);

-- Test cases for policy verification (commented out, not supported in Supabase/Postgres)
-- SELECT * FROM verify_policy(
--   'user_access_policy_select', 
--   'prompt_logs', 
--   'SELECT', 
--   'Should only return rows where user_id matches auth.uid()'
-- );
-- SELECT * FROM verify_policy(
--   'user_access_policy_insert', 
--   'prompt_logs', 
--   'INSERT', 
--   'Should only allow inserts where user_id matches auth.uid()'
-- );

-- Admin override policy (support team can access all data)
CREATE POLICY admin_access_policy ON prompt_logs
  FOR SELECT USING (auth.role() = 'admin');

CREATE POLICY admin_access_policy ON comparisons
  FOR SELECT USING (auth.role() = 'admin');

CREATE POLICY admin_access_policy ON spark_logs
  FOR SELECT USING (auth.role() = 'admin');

-- Removed anonymous_read_policy on spark_logs: not required by PRD and is_public column does not exist

-- Test user for policy verification
COMMENT ON POLICY user_access_policy_select ON prompt_logs IS 'Restricts access to user''s own prompt logs';
COMMENT ON POLICY admin_access_policy ON comparisons IS 'Allows admin access to all comparison data';

-- Indexes to support RLS performance
CREATE INDEX IF NOT EXISTS idx_prompt_logs_user_id ON prompt_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_user_id ON comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_spark_logs_user_id ON spark_logs(user_id); 