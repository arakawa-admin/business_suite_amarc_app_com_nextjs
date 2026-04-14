-- 0) apply スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS apply;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS apply.master_staff_options CASCADE;

-- 2) テーブル作成
CREATE TABLE apply.master_staff_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id uuid NOT NULL UNIQUE,
    birthday timestamptz NOT NULL,
    employ_type_id uuid NOT NULL,
    employ_start timestamptz NOT NULL,
    employ_deadline timestamptz NOT NULL,
    next_notification timestamptz,

    -- 外部キー制約
    CONSTRAINT fk_staff
        FOREIGN KEY (staff_id)
        REFERENCES common.master_staffs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_employ_type
        FOREIGN KEY (employ_type_id)
        REFERENCES apply.master_employ_types(id)
        ON DELETE CASCADE
);


-- 5) RLS有効化
ALTER TABLE apply.master_staff_options ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON apply.master_staff_options;

CREATE POLICY "authenticated can do all on status"
    ON apply.master_staff_options
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA apply TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE apply.master_staff_options TO authenticated, anon, service_role;
