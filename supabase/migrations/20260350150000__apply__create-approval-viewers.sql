-- 0) approval スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS apply;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS apply.approval_viewers CASCADE;

-- 2) テーブル作成
CREATE TABLE apply.approval_viewers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid NOT NULL,
    viewer_user_id uuid NOT NULL,
    is_commented boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- 外部キー制約
    CONSTRAINT fk_application
        FOREIGN KEY (application_id)
        REFERENCES apply.applications(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_viewer_user
        FOREIGN KEY (viewer_user_id)
        REFERENCES common.master_staffs(id)
        ON DELETE CASCADE,

    -- 申請書と閲覧者は重複NG 複合UNIQUE
    CONSTRAINT uq_application_viewer UNIQUE (application_id, viewer_user_id)
);

-- 3) updated_at 自動更新関数（スキーマ付きで作る）
CREATE OR REPLACE FUNCTION apply.update_updated_at_column_approval_viewers()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) トリガー（テーブルもスキーマ付き）
DROP TRIGGER IF EXISTS set_timestamp_approval_viewers ON apply.approval_viewers;

CREATE TRIGGER set_timestamp_approval_viewers
BEFORE UPDATE ON apply.approval_viewers
FOR EACH ROW
EXECUTE PROCEDURE apply.update_updated_at_column_approval_viewers();

-- 5) RLS有効化
ALTER TABLE apply.approval_viewers ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON apply.approval_viewers;

CREATE POLICY "authenticated can do all on status"
    ON apply.approval_viewers
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA approval TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE apply.approval_viewers TO authenticated, anon, service_role;
