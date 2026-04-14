-- 0) apply スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS apply;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS apply.master_form_approvers CASCADE;

-- 2) テーブル作成
CREATE TABLE apply.master_form_approvers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id uuid NOT NULL,
    apply_form_id uuid NOT NULL,

    approver_user_id uuid NOT NULL,
    sequence integer NOT NULL DEFAULT 1,
    valid_at timestamptz NOT NULL DEFAULT '2026-01-01T00:00:00Z',
    invalid_at timestamptz NOT NULL DEFAULT '2050-12-31T00:00:00Z',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- 外部キー制約
    CONSTRAINT fk_department
        FOREIGN KEY (department_id)
        REFERENCES common.master_departments(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_approver_user
        FOREIGN KEY (approver_user_id)
        REFERENCES common.master_staffs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_apply_form
        FOREIGN KEY (apply_form_id)
        REFERENCES apply.apply_forms(id)
        ON DELETE CASCADE,

    -- 承認者と部門は重複NG 複合UNIQUE
    CONSTRAINT uq_approver_department_apply_form UNIQUE (department_id, approver_user_id, apply_form_id),
    -- 承認順と部門は重複NG 複合UNIQUE
    CONSTRAINT uq_sequence_departmentapply_form UNIQUE (department_id, sequence, apply_form_id)
);

-- 3) updated_at 自動更新関数（スキーマ付きで作る）
CREATE OR REPLACE FUNCTION apply.update_updated_at_column_master_form_approvers()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) トリガー（テーブルもスキーマ付き）
DROP TRIGGER IF EXISTS set_timestamp_master_form_approvers ON apply.master_form_approvers;

CREATE TRIGGER set_timestamp_master_form_approvers
BEFORE UPDATE ON apply.master_form_approvers
FOR EACH ROW
EXECUTE PROCEDURE apply.update_updated_at_column_master_form_approvers();

-- 5) RLS有効化
ALTER TABLE apply.master_form_approvers ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on apply.master_form_approvers" ON apply.master_form_approvers;

CREATE POLICY "authenticated can do all on apply.master_form_approvers"
    ON apply.master_form_approvers
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA apply TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE apply.master_form_approvers TO authenticated, anon, service_role;
