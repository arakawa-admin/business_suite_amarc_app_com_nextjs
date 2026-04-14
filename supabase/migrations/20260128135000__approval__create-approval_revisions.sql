-- 0) approval スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS approval;

-- 1) 既存テーブルを削除（開発用。運用では注意）
DROP TABLE IF EXISTS approval.approval_revisions CASCADE;

-- 2) テーブル作成
CREATE TABLE approval.approval_revisions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id uuid NOT NULL,
    round integer NOT NULL DEFAULT 1,
    budget numeric NOT NULL DEFAULT 0,
    details text NOT NULL,
    depreciation_period_months integer DEFAULT 0,
    depreciation_amount numeric DEFAULT 0,
    start_date timestamptz NOT NULL,
    end_date timestamptz NOT NULL,
    billing_date timestamptz,
    payment_date timestamptz,

    snapshot_at timestamptz NOT NULL DEFAULT now(),
    snapshot_by uuid NOT NULL,

    -- 外部キー制約
    CONSTRAINT fk_approval
        FOREIGN KEY (approval_id)
        REFERENCES approval.approvals(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_snapshot_by
        FOREIGN KEY (snapshot_by)
        REFERENCES common.master_staffs(id)
        ON DELETE CASCADE,

    -- 稟議書と申請ラウンドは重複NG 複合UNIQUE
    CONSTRAINT uq_approval_round UNIQUE (approval_id, round)
);

-- 3) RLS有効化
ALTER TABLE approval.approval_revisions ENABLE ROW LEVEL SECURITY;

-- 4) ポリシー
DROP POLICY IF EXISTS "authenticated can do all on status" ON approval.approval_revisions;

CREATE POLICY "authenticated can do all on status"
    ON approval.approval_revisions
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- スキーマ権限
GRANT USAGE ON SCHEMA approval TO authenticated, anon, service_role;

-- テーブル権限
GRANT ALL ON TABLE approval.approval_revisions TO authenticated, anon, service_role;


-- extra) approvals → approval_revisions のFKを後から追加
ALTER TABLE approval.approvals
    ADD CONSTRAINT fk_current_revision
    FOREIGN KEY (current_revision_id)
    REFERENCES approval.approval_revisions(id)
    ON DELETE SET NULL;
