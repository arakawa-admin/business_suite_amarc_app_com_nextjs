-- 0) common スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS common;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS common.staff_departments CASCADE;

-- 2) テーブル作成
CREATE TABLE common.staff_departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id uuid NOT NULL,
    department_id uuid NOT NULL,
    -- is_primary boolean NOT NULL DEFAULT false,
    -- valid_at timestamptz NOT NULL DEFAULT '2025-10-01T00:00:00Z',
    -- invalid_at timestamptz NOT NULL DEFAULT '2050-12-31T00:00:00Z',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- 外部キー制約
    CONSTRAINT fk_staff
        FOREIGN KEY (staff_id)
        REFERENCES common.master_staffs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_department
        FOREIGN KEY (department_id)
        REFERENCES common.master_departments(id)
        ON DELETE CASCADE,

    -- スタッフと部門は重複NG 複合UNIQUE
    CONSTRAINT uq_staff_department UNIQUE (department_id, staff_id)
);

-- 3) updated_at 自動更新関数（スキーマ付きで作る）
CREATE OR REPLACE FUNCTION common.update_updated_at_column_staff_departments()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) トリガー（テーブルもスキーマ付き）
DROP TRIGGER IF EXISTS set_timestamp_staff_departments ON common.staff_departments;

CREATE TRIGGER set_timestamp_staff_departments
BEFORE UPDATE ON common.staff_departments
FOR EACH ROW
EXECUTE PROCEDURE common.update_updated_at_column_staff_departments();

-- 5) RLS有効化
ALTER TABLE common.staff_departments ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on staff-departments" ON common.staff_departments;

CREATE POLICY "authenticated can do all on staff-departments"
    ON common.staff_departments
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA common TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE common.staff_departments TO authenticated, anon, service_role;
