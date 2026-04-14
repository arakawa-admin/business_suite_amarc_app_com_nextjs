-- 0) apply スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS apply;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS apply.applications CASCADE;

-- 2) テーブル作成
CREATE TABLE apply.applications (
    id uuid primary key default gen_random_uuid(),
    apply_form_id uuid NOT NULL,
    department_id uuid NOT NULL,
    author_id uuid NOT NULL,

    status_id uuid NOT NULL,
    current_revision_id uuid null,

    completed_at timestamptz null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

        -- 外部キー制約
    CONSTRAINT fk_department
        FOREIGN KEY (department_id)
        REFERENCES common.master_departments(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_author
        FOREIGN KEY (author_id)
        REFERENCES common.master_staffs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_apply_form
        FOREIGN KEY (apply_form_id)
        REFERENCES apply.apply_forms(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_status
        FOREIGN KEY (status_id)
        REFERENCES apply.master_status(id)
        ON DELETE CASCADE
);

-- 5) RLS有効化
ALTER TABLE apply.applications ENABLE ROW LEVEL SECURITY;

-- 6) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON apply.applications;

CREATE POLICY "authenticated can do all on status"
    ON apply.applications
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA apply TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE apply.applications TO authenticated, anon, service_role;
