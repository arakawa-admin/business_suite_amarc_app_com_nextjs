-- 0) approval スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS approval;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS approval.approval_drafts CASCADE;

-- 2) テーブル作成
CREATE TABLE approval.approval_drafts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    owner_user_id uuid NOT NULL,
    payload jsonb NOT NULL,
    version integer NOT NULL DEFAULT 1,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- 外部キー制約
    CONSTRAINT fk_owner
        FOREIGN KEY (owner_user_id)
        REFERENCES common.master_staffs(id)
        ON DELETE CASCADE
);

-- 3) updated_at 自動更新関数（スキーマ付きで作る）
CREATE OR REPLACE FUNCTION approval.update_updated_at_column_approval_drafts()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) トリガー（テーブルもスキーマ付き）
DROP TRIGGER IF EXISTS set_timestamp_approval_drafts ON approval.approval_drafts;

CREATE TRIGGER set_timestamp_approval_drafts
BEFORE UPDATE ON approval.approval_drafts
FOR EACH ROW
EXECUTE PROCEDURE approval.update_updated_at_column_approval_drafts();

-- 5) RLS有効化
ALTER TABLE approval.approval_drafts ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON approval.approval_drafts;

CREATE POLICY "authenticated can do all on status"
    ON approval.approval_drafts
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA approval TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE approval.approval_drafts TO authenticated, anon, service_role;
