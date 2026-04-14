-- 0) apply スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS apply;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS apply.master_employ_types CASCADE;

-- 2) テーブル作成
CREATE TABLE apply.master_employ_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    code text NOT NULL UNIQUE,
    sort_order integer NOT NULL UNIQUE DEFAULT 10,
    remarks text,
    valid_at timestamptz NOT NULL DEFAULT '2025-10-01T00:00:00Z',
    invalid_at timestamptz NOT NULL DEFAULT '2050-12-31T00:00:00Z',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) updated_at 自動更新関数（スキーマ付きで作る）
CREATE OR REPLACE FUNCTION apply.update_updated_at_column_master_employ_types()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) トリガー（テーブルもスキーマ付き）
DROP TRIGGER IF EXISTS set_timestamp_master_employ_types ON apply.master_employ_types;

CREATE TRIGGER set_timestamp_master_employ_types
BEFORE UPDATE ON apply.master_employ_types
FOR EACH ROW
EXECUTE PROCEDURE apply.update_updated_at_column_master_employ_types();

-- 5) RLS有効化
ALTER TABLE apply.master_employ_types ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON apply.master_employ_types;

CREATE POLICY "authenticated can do all on status"
    ON apply.master_employ_types
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA apply TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE apply.master_employ_types TO authenticated, anon, service_role;
