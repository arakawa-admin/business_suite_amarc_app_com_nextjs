-- 0) approval スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS apply;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS apply.approval_actions CASCADE;

-- 2) テーブル作成
CREATE TABLE apply.approval_actions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid NOT NULL,
    action text NOT NULL,
    actor_user_id uuid NOT NULL,
    order_id uuid,
    comment text,
    action_at timestamptz NOT NULL DEFAULT now(),

    -- 外部キー制約
    CONSTRAINT fk_application
        FOREIGN KEY (application_id)
        REFERENCES apply.applications(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_actor_user
        FOREIGN KEY (actor_user_id)
        REFERENCES common.master_staffs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order
        FOREIGN KEY (order_id)
        REFERENCES apply.approval_orders(id)
        ON DELETE CASCADE
);

-- 3) updated_at 自動更新関数（スキーマ付きで作る）
CREATE OR REPLACE FUNCTION apply.update_updated_at_column_approval_actions()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) トリガー（テーブルもスキーマ付き）
DROP TRIGGER IF EXISTS set_timestamp_approval_actions ON apply.approval_actions;

CREATE TRIGGER set_timestamp_approval_actions
BEFORE UPDATE ON apply.approval_actions
FOR EACH ROW
EXECUTE PROCEDURE apply.update_updated_at_column_approval_actions();

-- 5) RLS有効化
ALTER TABLE apply.approval_actions ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON apply.approval_actions;

CREATE POLICY "authenticated can do all on status"
    ON apply.approval_actions
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA approval TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE apply.approval_actions TO authenticated, anon, service_role;
