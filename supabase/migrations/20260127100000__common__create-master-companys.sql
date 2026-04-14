-- 0) common スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS common;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS common.master_companys CASCADE;

-- 2) テーブル作成
CREATE TABLE common.master_companys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    kana text NOT NULL,
    sort_order integer NOT NULL UNIQUE DEFAULT 0,
    remarks text,
    valid_at timestamptz NOT NULL DEFAULT '2025-10-01T00:00:00Z',
    invalid_at timestamptz NOT NULL DEFAULT '2050-12-31T00:00:00Z',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) updated_at 自動更新関数（スキーマ付きで作る）
CREATE OR REPLACE FUNCTION common.update_updated_at_column_master_companys()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) トリガー（テーブルもスキーマ付き）
DROP TRIGGER IF EXISTS set_timestamp_master_companys ON common.master_companys;

CREATE TRIGGER set_timestamp_master_companys
BEFORE UPDATE ON common.master_companys
FOR EACH ROW
EXECUTE PROCEDURE common.update_updated_at_column_master_companys();

-- 5) RLS有効化
ALTER TABLE common.master_companys ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on companys" ON common.master_companys;

CREATE POLICY "authenticated can do all on companys"
    ON common.master_companys
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA common TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE common.master_companys TO authenticated, anon, service_role;
