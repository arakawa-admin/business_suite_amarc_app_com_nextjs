-- 0) apply スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS apply;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS apply.attachments CASCADE;

-- 2) テーブル作成
CREATE TABLE apply.attachments (
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
ALTER TABLE apply.attachments ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON apply.attachments;

CREATE POLICY "authenticated can do all on status"
    ON apply.attachments
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA apply TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE apply.attachments TO authenticated, anon, service_role;
