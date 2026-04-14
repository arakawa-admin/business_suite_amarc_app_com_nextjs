-- 0) approval スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS approval;
CREATE SCHEMA IF NOT EXISTS common;

-- approval スキーマ内に common.master_departments のビューを作成
CREATE VIEW approval.master_departments AS
SELECT * FROM common.master_departments;

-- approval スキーマ内に common.master_staffs のビューを作成
CREATE VIEW approval.master_staffs AS
SELECT * FROM common.master_staffs;

-- ビューにも権限を付与
GRANT SELECT ON approval.master_departments TO authenticated, anon;
GRANT SELECT ON approval.master_staffs TO authenticated, anon;
