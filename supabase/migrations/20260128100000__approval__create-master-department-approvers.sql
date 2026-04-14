-- 0) approval スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS approval;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS approval.master_department_approvers CASCADE;

-- 2) テーブル作成
CREATE TABLE approval.master_department_approvers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id uuid NOT NULL,
    sequence integer NOT NULL UNIQUE DEFAULT 1,
    approver_user_id uuid NOT NULL,
    remarks text,
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

    -- 承認者と部門は重複NG 複合UNIQUE
    CONSTRAINT uq_approver_department UNIQUE (department_id, approver_user_id),
    -- 承認順と部門は重複NG 複合UNIQUE
    CONSTRAINT uq_sequence_department UNIQUE (department_id, sequence)
);

-- 3) updated_at 自動更新関数（スキーマ付きで作る）
CREATE OR REPLACE FUNCTION approval.update_updated_at_column_master_department_approvers()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) トリガー（テーブルもスキーマ付き）
DROP TRIGGER IF EXISTS set_timestamp_master_department_approvers ON approval.master_department_approvers;

CREATE TRIGGER set_timestamp_master_department_approvers
BEFORE UPDATE ON approval.master_department_approvers
FOR EACH ROW
EXECUTE PROCEDURE approval.update_updated_at_column_master_department_approvers();

-- 5) RLS有効化
ALTER TABLE approval.master_department_approvers ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on approval.master_department_approvers" ON approval.master_department_approvers;

CREATE POLICY "authenticated can do all on approval.master_department_approvers"
    ON approval.master_department_approvers
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA approval TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE approval.master_department_approvers TO authenticated, anon, service_role;
