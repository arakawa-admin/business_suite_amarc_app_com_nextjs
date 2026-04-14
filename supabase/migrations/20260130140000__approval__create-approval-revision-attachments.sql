-- 0) approval スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS approval;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS approval.approval_revision_attachments CASCADE;

-- 2) テーブル作成
CREATE TABLE approval.approval_revision_attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_revision_id uuid NOT NULL,
    attachment_id uuid NOT NULL,
    role text,
    sort_order integer,
    added_by uuid NOT NULL,
    added_at timestamptz NOT NULL DEFAULT now(),

    -- 外部キー制約
    CONSTRAINT fk_approval_revision
        FOREIGN KEY (approval_revision_id)
        REFERENCES approval.approval_revisions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_attachment
        FOREIGN KEY (attachment_id)
        REFERENCES approval.attachments(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_add_user
        FOREIGN KEY (added_by)
        REFERENCES common.master_staffs(id)
        ON DELETE CASCADE,

    -- リビジョンとファイルIDは重複NG 複合UNIQUE
    CONSTRAINT uq_approval_revision_attachment UNIQUE (approval_revision_id, attachment_id)
);

-- 5) RLS有効化
ALTER TABLE approval.approval_revision_attachments ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON approval.approval_revision_attachments;

CREATE POLICY "authenticated can do all on status"
    ON approval.approval_revision_attachments
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA approval TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE approval.approval_revision_attachments TO authenticated, anon, service_role;
