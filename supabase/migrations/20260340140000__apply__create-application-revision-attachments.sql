-- 0) apply スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS apply;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS apply.application_revision_attachments CASCADE;

-- 2) テーブル作成
CREATE TABLE apply.application_revision_attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_revision_id uuid NOT NULL,
    attachment_id uuid NOT NULL,
    label text,
    sort_order integer,
    created_at timestamptz NOT NULL DEFAULT now(),

    -- 外部キー制約
    CONSTRAINT fk_application_revision
        FOREIGN KEY (application_revision_id)
        REFERENCES apply.application_revisions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_attachment
        FOREIGN KEY (attachment_id)
        REFERENCES apply.attachments(id)
        ON DELETE CASCADE,

    -- リビジョンとファイルIDは重複NG 複合UNIQUE
    CONSTRAINT uq_application_revision_attachment UNIQUE (application_revision_id, attachment_id)
);

-- 5) RLS有効化
ALTER TABLE apply.application_revision_attachments ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON apply.application_revision_attachments;

CREATE POLICY "authenticated can do all on status"
    ON apply.application_revision_attachments
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA apply TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE apply.application_revision_attachments TO authenticated, anon, service_role;
