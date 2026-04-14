-- 0) approval スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS approval;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS approval.approvals CASCADE;

-- 2) テーブル作成
CREATE TABLE approval.approvals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_no text NOT NULL,
    title text NOT NULL,
    author_id uuid NOT NULL,
    author_name_snapshot text NOT NULL,
    department_id uuid NOT NULL,
    department_name_snapshot text NOT NULL,
    status_id uuid NOT NULL,
    current_revision_id uuid,

    -- TODO
    -- current_order_id
    -- returned_order_id
    -- is_disclosure
    -- capital_plan_id

    submitted_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- 外部キー制約
    CONSTRAINT fk_staff
        FOREIGN KEY (author_id)
        REFERENCES common.master_staffs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_department
        FOREIGN KEY (department_id)
        REFERENCES common.master_departments(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_status
        FOREIGN KEY (status_id)
        REFERENCES approval.master_status(id)
        ON DELETE CASCADE

    -- approval_revisions 作ってからFKを追加
    -- CONSTRAINT fk_current_revision
    --     FOREIGN KEY (current_revision_id)
    --     REFERENCES approval.approval_revisions(id)
    --     ON DELETE CASCADE
);

-- 3) updated_at 自動更新関数（スキーマ付きで作る）
CREATE OR REPLACE FUNCTION approval.update_updated_at_column_approvals()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) トリガー（テーブルもスキーマ付き）
DROP TRIGGER IF EXISTS set_timestamp_approvals ON approval.approvals;

CREATE TRIGGER set_timestamp_approvals
BEFORE UPDATE ON approval.approvals
FOR EACH ROW
EXECUTE PROCEDURE approval.update_updated_at_column_approvals();

-- 5) RLS有効化
ALTER TABLE approval.approvals ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON approval.approvals;

CREATE POLICY "authenticated can do all on status"
    ON approval.approvals
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA approval TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE approval.approvals TO authenticated, anon, service_role;
