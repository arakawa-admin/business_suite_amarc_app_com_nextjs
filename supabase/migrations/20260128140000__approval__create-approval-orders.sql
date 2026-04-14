-- 0) approval スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS approval;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS approval.approval_orders CASCADE;

-- 2) テーブル作成
CREATE TABLE approval.approval_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id uuid NOT NULL,
    approver_user_id uuid NOT NULL,
    sequence integer NOT NULL DEFAULT 1,
    status_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- 外部キー制約
    CONSTRAINT fk_approval
        FOREIGN KEY (approval_id)
        REFERENCES approval.approvals(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_approver_user
        FOREIGN KEY (approver_user_id)
        REFERENCES common.master_staffs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_status
        FOREIGN KEY (status_id)
        REFERENCES approval.master_status(id)
        ON DELETE CASCADE,

    -- 稟議書と承認者は重複NG 複合UNIQUE
    CONSTRAINT uq_approval_approver UNIQUE (approval_id, approver_user_id),

    -- 稟議書と承認順は重複NG 複合UNIQUE
    CONSTRAINT uq_approval_sequence UNIQUE (approval_id, sequence)
);

-- 3) updated_at 自動更新関数（スキーマ付きで作る）
CREATE OR REPLACE FUNCTION approval.update_updated_at_column_approval_orders()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) トリガー（テーブルもスキーマ付き）
DROP TRIGGER IF EXISTS set_timestamp_approval_orders ON approval.approval_orders;

CREATE TRIGGER set_timestamp_approval_orders
BEFORE UPDATE ON approval.approval_orders
FOR EACH ROW
EXECUTE PROCEDURE approval.update_updated_at_column_approval_orders();

-- 5) RLS有効化
ALTER TABLE approval.approval_orders ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON approval.approval_orders;

CREATE POLICY "authenticated can do all on status"
    ON approval.approval_orders
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA approval TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE approval.approval_orders TO authenticated, anon, service_role;
