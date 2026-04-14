-- 0) approval スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS approval;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS approval.approval_reviewers CASCADE;

-- 2) テーブル作成
CREATE TABLE approval.approval_reviewers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id uuid NOT NULL,
    reviewer_user_id uuid NOT NULL,
    is_commented boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- 外部キー制約
    CONSTRAINT fk_approval
        FOREIGN KEY (approval_id)
        REFERENCES approval.approvals(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reviewer_user
        FOREIGN KEY (reviewer_user_id)
        REFERENCES common.master_staffs(id)
        ON DELETE CASCADE,

    -- 稟議書と回議者は重複NG 複合UNIQUE
    CONSTRAINT uq_approval_reviewer UNIQUE (approval_id, reviewer_user_id)
);

-- 3) updated_at 自動更新関数（スキーマ付きで作る）
CREATE OR REPLACE FUNCTION approval.update_updated_at_column_approval_reviewers()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) トリガー（テーブルもスキーマ付き）
DROP TRIGGER IF EXISTS set_timestamp_approval_reviewers ON approval.approval_reviewers;

CREATE TRIGGER set_timestamp_approval_reviewers
BEFORE UPDATE ON approval.approval_reviewers
FOR EACH ROW
EXECUTE PROCEDURE approval.update_updated_at_column_approval_reviewers();

-- 5) RLS有効化
ALTER TABLE approval.approval_reviewers ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON approval.approval_reviewers;

CREATE POLICY "authenticated can do all on status"
    ON approval.approval_reviewers
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA approval TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE approval.approval_reviewers TO authenticated, anon, service_role;
