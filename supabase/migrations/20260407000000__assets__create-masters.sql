-- =========================================================
-- assets.master_permit_categories
-- 許認可カテゴリーマスター
-- =========================================================

create extension if not exists pgcrypto;

DROP TABLE IF EXISTS assets.master_permit_categories CASCADE;
create table if not exists assets.master_permit_categories (
    id uuid primary key default gen_random_uuid(),
    code text not null,
    name text not null,
    sort_order integer not null default 0,
    remarks text null,
    valid_at timestamptz null,
    invalid_at timestamptz null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint master_permit_categories_code_key unique (code),
    constraint master_permit_categories_sort_order_check check (sort_order >= 0),
    constraint master_permit_categories_validity_check check (
        invalid_at is null
        or valid_at is null
        or valid_at <= invalid_at
    )
);

comment on table assets.master_permit_categories is '許認可分類マスタ';
comment on column assets.master_permit_categories.id is '主キー';
comment on column assets.master_permit_categories.code is '分類コード';
comment on column assets.master_permit_categories.name is '分類名';
comment on column assets.master_permit_categories.sort_order is '表示順';
comment on column assets.master_permit_categories.remarks is '備考';
comment on column assets.master_permit_categories.valid_at is '有効開始日時。null は開始制限なし';
comment on column assets.master_permit_categories.invalid_at is '有効終了日時。null は終了制限なし';
comment on column assets.master_permit_categories.created_at is '作成日時';
comment on column assets.master_permit_categories.updated_at is '更新日時';

