-- 0) common スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS common;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS common.master_login_users CASCADE;

-- 2) テーブル作成
CREATE TABLE common.master_login_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    is_admin boolean NOT NULL DEFAULT false,
    valid_at timestamptz NOT NULL DEFAULT '2026-01-01T00:00:00Z',
    invalid_at timestamptz NOT NULL DEFAULT '2050-12-31T00:00:00Z',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) updated_at 自動更新関数（スキーマ付きで作る）
CREATE OR REPLACE FUNCTION common.update_updated_at_column_master_login_users()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) トリガー（テーブルもスキーマ付き）
DROP TRIGGER IF EXISTS set_timestamp_master_login_users ON common.master_login_users;

CREATE TRIGGER set_timestamp_master_login_users
BEFORE UPDATE ON common.master_login_users
FOR EACH ROW
EXECUTE PROCEDURE common.update_updated_at_column_master_login_users();

-- 5) RLS有効化
ALTER TABLE common.master_login_users ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on login_users" ON common.master_login_users;

CREATE POLICY "authenticated can do all on login_users"
    ON common.master_login_users
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA common TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE common.master_login_users TO authenticated, anon, service_role;
