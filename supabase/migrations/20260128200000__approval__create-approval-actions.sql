-- 0) approval スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS approval;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS approval.approval_actions CASCADE;

-- 2) テーブル作成
CREATE TABLE approval.approval_actions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id uuid NOT NULL,
    action text NOT NULL,
    actor_user_id uuid NOT NULL,
    order_id uuid,
    reviewer_id uuid,
    comment text,
    action_at timestamptz NOT NULL DEFAULT now(),

    -- 外部キー制約
    CONSTRAINT fk_approval
        FOREIGN KEY (approval_id)
        REFERENCES approval.approvals(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_actor_user
        FOREIGN KEY (actor_user_id)
        REFERENCES common.master_staffs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order
        FOREIGN KEY (order_id)
        REFERENCES approval.approval_orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reviewer
        FOREIGN KEY (reviewer_id)
        REFERENCES approval.approval_reviewers(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_action_target_one
        CHECK (
            -- order に紐づく
            (order_id IS NOT NULL AND reviewer_id IS NULL)
            OR
            -- reviewer に紐づく
            (order_id IS NULL AND reviewer_id IS NOT NULL)
            OR
            -- 全体アクション（submit/resubmit/cancel 等）
            (order_id IS NULL AND reviewer_id IS NULL)
        )
);

-- 3) updated_at 自動更新関数（スキーマ付きで作る）
CREATE OR REPLACE FUNCTION approval.update_updated_at_column_approval_actions()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) トリガー（テーブルもスキーマ付き）
DROP TRIGGER IF EXISTS set_timestamp_approval_actions ON approval.approval_actions;

CREATE TRIGGER set_timestamp_approval_actions
BEFORE UPDATE ON approval.approval_actions
FOR EACH ROW
EXECUTE PROCEDURE approval.update_updated_at_column_approval_actions();

-- 5) RLS有効化
ALTER TABLE approval.approval_actions ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON approval.approval_actions;

CREATE POLICY "authenticated can do all on status"
    ON approval.approval_actions
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA approval TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE approval.approval_actions TO authenticated, anon, service_role;
