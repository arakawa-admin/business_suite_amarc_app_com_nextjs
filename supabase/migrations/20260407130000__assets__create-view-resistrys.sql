/*
=========================================================
assets.v_audit_logs_list
監査ログ一覧表示用 View

【目的】
- assets.audit_logs を一覧画面・詳細画面で見やすくする
- created_by に対応する staff 名を join 済みで返す
- entity_type / entity_id / action_code / summary / metadata を
  そのまま UI で扱いやすくする

【用途】
- 管理者向け監査ログ一覧画面
- permit / reminder / comment 詳細画面での絞り込み表示
- 将来的な「履歴タブ」統合の土台

【補足】
- metadata は jsonb のまま返す
- 表示名の整形は UI 側でも可能だが、
  一覧画面用に action_name を簡易付与している
=========================================================
*/
drop view if exists assets.v_audit_logs_list;

create or replace view assets.v_audit_logs_list as
select
    al.id,

    al.entity_type,
    al.entity_id,

    al.action_code,
    case
        when al.action_code = 'create' then '登録'
        when al.action_code = 'update' then '更新'
        when al.action_code = 'delete' then '削除'
        when al.action_code = 'restore' then '復元'
        when al.action_code = 'complete' then '完了'
        when al.action_code = 'status_change' then 'ステータス変更'
        when al.action_code = 'send_notification' then '通知送信'
        else al.action_code
    end as action_name,

    al.summary,
    al.metadata,

    al.created_at,
    al.created_by,
    ms.name as created_by_name

from assets.audit_logs al
left join common.master_staffs ms
    on ms.id = al.created_by;

comment on view assets.v_audit_logs_list is
'監査ログ一覧表示用View。assets.audit_logs に実行者名を付与して返す。';

comment on column assets.v_audit_logs_list.id is
'監査ログID。';

comment on column assets.v_audit_logs_list.entity_type is
'対象エンティティ種別。permit / reminder / comment など。';

comment on column assets.v_audit_logs_list.entity_id is
'対象エンティティID。';

comment on column assets.v_audit_logs_list.action_code is
'操作種別コード。create / update / delete / complete / status_change など。';

comment on column assets.v_audit_logs_list.action_name is
'操作種別表示名。一覧表示用の簡易名称。';

comment on column assets.v_audit_logs_list.summary is
'監査ログの要約。';

comment on column assets.v_audit_logs_list.metadata is
'補助情報 JSON。差分、削除前スナップショットなどを格納する。';

comment on column assets.v_audit_logs_list.created_at is
'監査ログ作成日時。';

comment on column assets.v_audit_logs_list.created_by is
'実行者 staff ID。';

comment on column assets.v_audit_logs_list.created_by_name is
'実行者名。common.master_staffs.name。';
