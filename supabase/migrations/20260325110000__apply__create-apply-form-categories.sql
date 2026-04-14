-- 0) apply スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS apply;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS apply.apply_form_categories CASCADE;

-- 2) テーブル作成
CREATE TABLE apply.apply_form_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    code text NOT NULL UNIQUE,
    description text,
    sort_order integer NOT NULL UNIQUE DEFAULT 10,
    valid_at timestamptz NOT NULL DEFAULT '2026-01-01T00:00:00Z',
    invalid_at timestamptz NOT NULL DEFAULT '2050-12-31T00:00:00Z',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) updated_at 自動更新関数（スキーマ付きで作る）
CREATE OR REPLACE FUNCTION apply.update_updated_at_column_apply_form_categories()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) トリガー（テーブルもスキーマ付き）
DROP TRIGGER IF EXISTS set_timestamp_apply_form_categories ON apply.apply_form_categories;

CREATE TRIGGER set_timestamp_apply_form_categories
BEFORE UPDATE ON apply.apply_form_categories
FOR EACH ROW
EXECUTE PROCEDURE apply.update_updated_at_column_apply_form_categories();

-- 5) RLS有効化
ALTER TABLE apply.apply_form_categories ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON apply.apply_form_categories;

CREATE POLICY "authenticated can do all on status"
    ON apply.apply_form_categories
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA apply TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE apply.apply_form_categories TO authenticated, anon, service_role;
