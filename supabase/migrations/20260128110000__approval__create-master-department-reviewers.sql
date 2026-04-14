-- 0) approval スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS approval;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS approval.master_department_reviewers CASCADE;

-- 2) テーブル作成
CREATE TABLE approval.master_department_reviewers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id uuid NOT NULL,
    reviewer_user_id uuid NOT NULL,
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

    CONSTRAINT fk_reviewer_user
        FOREIGN KEY (reviewer_user_id)
        REFERENCES common.master_staffs(id)
        ON DELETE CASCADE,

    -- 回議者と部門は重複NG 複合UNIQUE
    CONSTRAINT uq_reviewer_department UNIQUE (department_id, reviewer_user_id)
);

-- 3) updated_at 自動更新関数（スキーマ付きで作る）
CREATE OR REPLACE FUNCTION approval.update_updated_at_column_master_department_reviewers()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) トリガー（テーブルもスキーマ付き）
DROP TRIGGER IF EXISTS set_timestamp_master_department_reviewers ON approval.master_department_reviewers;

CREATE TRIGGER set_timestamp_master_department_reviewers
BEFORE UPDATE ON approval.master_department_reviewers
FOR EACH ROW
EXECUTE PROCEDURE approval.update_updated_at_column_master_department_reviewers();

-- 5) RLS有効化
ALTER TABLE approval.master_department_reviewers ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on approval.master_department_reviewers" ON approval.master_department_reviewers;

CREATE POLICY "authenticated can do all on approval.master_department_reviewers"
    ON approval.master_department_reviewers
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
-- GRANT USAGE ON SCHEMA approval TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE approval.master_department_reviewers TO authenticated, anon, service_role;
