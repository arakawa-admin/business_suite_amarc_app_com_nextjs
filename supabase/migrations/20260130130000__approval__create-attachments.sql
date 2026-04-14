-- 0) approval スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS approval;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS approval.attachments CASCADE;

-- 2) テーブル作成
CREATE TABLE approval.attachments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    sha256 text NOT NULL,
    bucket text NOT NULL,
    storage_key text NOT NULL,
    filename text NOT NULL,
    content_type text NOT NULL,
    byte_size bigint NOT NULL,

    thumbnail_key text,
    thumbnail_type text,
    thumbnail_size bigint,

    uploaded_by uuid NOT NULL,
    uploaded_at timestamptz NOT NULL DEFAULT now(),

    constraint attachments_pkey primary key (id),
    -- constraint uq_attachments_sha256_size unique (sha256, byte_size),

    -- 外部キー制約
    CONSTRAINT fk_uploader
        FOREIGN KEY (uploaded_by)
        REFERENCES common.master_staffs(id)
        ON DELETE CASCADE
);

-- 5) RLS有効化
ALTER TABLE approval.attachments ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON approval.attachments;

CREATE POLICY "authenticated can do all on status"
    ON approval.attachments
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA approval TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE approval.attachments TO authenticated, anon, service_role;
