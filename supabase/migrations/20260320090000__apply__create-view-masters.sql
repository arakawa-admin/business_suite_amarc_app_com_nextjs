-- 0) apply スキーマを作る（存在しない場合）
CREATE SCHEMA IF NOT EXISTS apply;
CREATE SCHEMA IF NOT EXISTS common;

-- apply スキーマ内に common.master_departments のビューを作成
CREATE VIEW apply.master_departments AS
SELECT * FROM common.master_departments;

-- apply スキーマ内に common.master_staffs のビューを作成
CREATE VIEW apply.master_staffs AS
SELECT * FROM common.master_staffs;

-- ビューにも権限を付与
GRANT SELECT ON apply.master_departments TO authenticated, anon;
GRANT SELECT ON apply.master_staffs TO authenticated, anon;
