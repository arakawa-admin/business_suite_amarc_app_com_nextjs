-- 0) approval スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS common;
CREATE SCHEMA IF NOT EXISTS apply;
CREATE SCHEMA IF NOT EXISTS approval;
CREATE SCHEMA IF NOT EXISTS assets;

-- common スキーマをAPIロールが使えるようにする（最低限）
GRANT USAGE ON SCHEMA common TO anon, authenticated, service_role;
-- common 内のテーブルに対する権限（シードは service_role で書くので最低限これ）
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA common TO service_role;
-- 今後作るテーブルにも自動で権限が付くように（重要）
ALTER DEFAULT PRIVILEGES IN SCHEMA common
GRANT ALL ON TABLES TO service_role;


-- apply スキーマをAPIロールが使えるようにする（最低限）
GRANT USAGE ON SCHEMA apply TO anon, authenticated, service_role;
-- apply 内のテーブルに対する権限（シードは service_role で書くので最低限これ）
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA apply TO service_role;
-- 今後作るテーブルにも自動で権限が付くように（重要）
ALTER DEFAULT PRIVILEGES IN SCHEMA apply
GRANT ALL ON TABLES TO service_role;


-- approval スキーマをAPIロールが使えるようにする（最低限）
GRANT USAGE ON SCHEMA approval TO anon, authenticated, service_role;
-- approval 内のテーブルに対する権限（シードは service_role で書くので最低限これ）
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA approval TO service_role;
-- 今後作るテーブルにも自動で権限が付くように（重要）
ALTER DEFAULT PRIVILEGES IN SCHEMA approval
GRANT ALL ON TABLES TO service_role;


-- assets スキーマをAPIロールが使えるようにする（最低限）
GRANT USAGE ON SCHEMA assets TO anon, authenticated, service_role;
-- assets 内のテーブルに対する権限（シードは service_role で書くので最低限これ）
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA assets TO service_role;
-- 今後作るテーブルにも自動で権限が付くように（重要）
ALTER DEFAULT PRIVILEGES IN SCHEMA assets
GRANT ALL ON TABLES TO service_role;


ALTER ROLE authenticator SET search_path TO public, approval, apply, common, assets;
