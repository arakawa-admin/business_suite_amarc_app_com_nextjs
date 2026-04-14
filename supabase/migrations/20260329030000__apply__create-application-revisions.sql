-- 0) apply スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS apply;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS apply.application_revisions CASCADE;

-- 2) テーブル作成
CREATE TABLE apply.application_revisions (
    id uuid primary key default gen_random_uuid(),
    application_id uuid NOT NULL,
    revision_no int not null,
    payload jsonb not null,

    submitted_at timestamptz null,
    created_by uuid not null,
    created_at timestamptz not null default now(),

        -- 外部キー制約
    CONSTRAINT fk_application
        FOREIGN KEY (application_id)
        REFERENCES apply.applications(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_creater
        FOREIGN KEY (created_by)
        REFERENCES common.master_staffs(id)
        ON DELETE CASCADE
);

-- 5) RLS有効化
ALTER TABLE apply.application_revisions ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON apply.application_revisions;

CREATE POLICY "authenticated can do all on status"
    ON apply.application_revisions
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA apply TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE apply.application_revisions TO authenticated, anon, service_role;
