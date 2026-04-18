# assets_template_manual_v2.md
## 業務システム向けテンプレ資産マニュアル v2
対象: Next.js App Router + TypeScript + MUI + Supabase + R2 を使った、日本企業向け業務システム

---

# 0. 現在の到達状況

このプロジェクトでは、当初の 10 個のテンプレ資産候補のうち、次のものがかなり進んでいる。

## 進行度が高い
1. CRUD 一式
2. マスタ管理
3. 添付ファイル
4. 通知 / リマインダ
5. 検索 / 絞り込み / 一覧条件保存
   - ただし「一覧条件保存」は未着手
   - 進んでいるのは「検索 / 絞り込み」まで

## まだこれから
6. コメント / メモ / 履歴
7. 監査ログ
8. ステータス遷移
9. 論理削除と復元
10. エクスポート

---

# 1. 今後のおすすめ優先順位

現在の進捗と再利用性を踏まえると、次の順で進めるのがおすすめ。

1. CRUD 一式
2. マスタ管理
3. 添付ファイル
4. 通知 / リマインダ
5. 検索 / 絞り込み / 一覧条件保存
6. コメント / メモ / 履歴
7. 監査ログ
8. ステータス遷移
9. 論理削除と復元
10. エクスポート

## この順番にする理由
- 1〜5 はすでに permits を題材にかなり土台ができている
- 6〜7 は 1〜5 の仕組みをそのまま流用しやすい
- 8〜10 はさらに上位の業務ルールや出力要件に寄るため、後段に回した方が整理しやすい

---

# 2. 全体方針

## 2-1. 基本思想
- まず 1 本、業務で使える形まで通す
- 2 本目以降で共通化する
- 先に完全汎化しすぎない
- ただし、責務の分離は最初から意識する

## 2-2. 責務分離の原則
- page.tsx: server fetch
- components: 表示 / 入力
- schemas: zod 検証
- repositories: DB / storage 入出力
- actions: current staff 補完、検証、永続化、revalidate / redirect
- helpers / mappers: 表示用整形や snake_case / camelCase 変換

## 2-3. current staff の原則
- login_user 1 : staff 多
- selected_staff_id cookie を使って current staff を server 側で解決
- created_by / updated_by / 監査系は current staff ベース
- client から created_by / updated_by を渡さない

---

# 3. 各テンプレ資産の現状と方針

# 3-1. CRUD 一式

## 現状
permits を題材に、以下がかなり進んでいる。

- page.tsx server fetch
- PermitForm
- create / edit / detail / list
- repository 分離
- mappers で snake_case / camelCase 変換
- soft delete / restore / hard delete の土台
- PermitList / PermitDetail

## テンプレ原則
- 監査列は server 側で補完
- 表示用状態は view / helper で算出
- repository は DB 操作に寄せる
- action は業務判断と current staff 補完に寄せる

---

# 3-2. マスタ管理

## 現状
master_permit_categories を題材に、共通テンプレ化がかなり進んでいる。

## 標準方針
is_active ではなく、以下を標準採用する。

- valid_at timestamptz null
- invalid_at timestamptz null

現在有効かどうかは helper / repository / view で判定する。

## 標準カラム
- id
- code
- name
- sort_order
- remarks
- valid_at
- invalid_at
- created_at
- updated_at

## 標準ルール
- 業務入力画面では active 候補だけを出す
- 管理画面では全件見せる
- 自由入力からの自動マスタ登録は原則しない
- 分類などの業務上重要な選択肢は、Select または freeSolo なし Autocomplete に寄せる

## 共通化の方向
shared に置くもの:
- masterCommonTypes
- masterCommonSchema
- masterValidity helper
- masterCommonMapper
- masterCrudRepository
- MasterFormBase
- MasterListBase
- MasterDetailBase

個別に残すもの:
- テーブル名
- ラベル
- action
- path
- 将来の追加列

---

# 3-3. 添付ファイル

## 現状
かなり進んでいる。以下まで整理済み。

- attachments
- attachment_links
- R2 direct upload
- 非公開バケット前提
- GET 署名URL
- cleanup
- orphan attachment cleanup
- thumbnail 保存
- AttachmentUploader の共通パッケージ化方針

## DB 方針
### attachments
- original を保持
- thumbnail も保持
- linked_at は「初回利用日時」の記録
- orphan 判定は active な attachment_links の有無で行う

### attachment_links
- 汎用 target_type / target_id 方式
- permit, vehicle などへ横展開しやすい
- edit 時は最終状態をサーバで差分同期する

## 非公開バケット方針
- upload 用: PUT 署名URL
- 表示用: GET 署名URL
- create 直後プレビュー: blob URL
- detail / edit 再表示: server で viewUrl / thumbnailViewUrl を発行

## サムネイル方針
- original と thumbnail の両方を R2 保存
- 一覧 / グリッドは thumbnail
- lightbox / 原本表示は original

## cleanup 方針
- service role / admin client で実行
- CRON_SECRET で保護された internal API
- orphan 判定:
  - attachments.deleted_at is null
  - active な attachment_links が 1 件もない
  - uploaded_at が一定時間より古い

---

# 3-4. 通知 / リマインダ

## 現状
permits ではかなり土台がある。

- reminders テーブル
- permit の due_on / alert_on 管理
- replacePermitReminders
- v_permits_list の状態算出

## 現時点の位置づけ
通知ログや外部通知まで完全には進んでいないが、テンプレの中心になる「期限 / アラート / 個別日付管理」の考え方は整理済み。

## 方針
- reminder は target_type / target_id で汎用化
- permit, vehicle_insurance, vehicle_inspection_log などへ展開しやすくする
- UI は最初は明示的な個別日付登録を基本にする
- 自動計算は helper と action 側で補助する

---

# 3-5. 検索 / 絞り込み / 一覧条件保存

## 現状
検索 / 絞り込みはかなり進んでいる。

- PermitList に DataGrid
- 検索UI追加
- URL クエリ反映
- page.tsx searchParams 対応
- repository 側の検索条件反映
- 検索UIを PermitListFilters として切り出し

## 未着手
- 一覧条件保存

## 現時点のテンプレ方針
まずはこの順で作る。

1. 検索UI
2. URL クエリ
3. server fetch
4. repository 条件反映
5. その後に一覧条件保存

最初から保存機能までやらず、まず URL 共有可能な一覧を作る。

---

# 4. まだ残っているテンプレ資産

# 4-1. コメント / メモ / 履歴
次の有力候補。attachment_links や target_type の考え方を流用しやすい。

## 方向性
- comments テーブル
- target_type / target_id
- comment_type や visibility は必要なら後付け
- 添付は attachment_links を流用

---

# 4-2. 監査ログ
created_by / updated_by / current staff の流れが整ってきたので次に進めやすい。

## 方向性
- actor_staff_id
- target_type / target_id
- action
- summary
- metadata jsonb
- occurred_at

---

# 4-3. ステータス遷移
業務ルール寄りなので、監査ログやコメントより後の方が組みやすい。

---

# 4-4. 論理削除と復元
CRUD の土台はあるが、テンプレとしてまだ横展開整理は残っている。

## 方向性
- deleted_at / deleted_by
- 一覧には原則出さない
- detail / restore / hard delete の責務分離

---

# 4-5. エクスポート
CSV / Excel / PDF など出力要件依存が強いので最後に回すのが安全。

---

# 5. 推奨ディレクトリ構成

最初はファイルを増やしすぎない。

```txt
src/
  app/
    (authorized)/
      permits/
        page.tsx
        new/page.tsx
        [id]/page.tsx
        [id]/edit/page.tsx
      master/
        permit-categories/
          page.tsx
          new/page.tsx
          [id]/page.tsx
          [id]/edit/page.tsx
    api/
      attachments/
        presign/route.ts
        register/route.ts
        view-url/route.ts
      internal/
        cron/
          cleanup-attachments/route.ts

  features/
    assets/
      shared/
        types/
          assetsDomainTypes.ts

      permits/
        actions/
          permitActions.ts
        components/
          PermitForm.tsx
          PermitList.tsx
          PermitListFilters.tsx
          PermitDetail.tsx
        repositories/
          permitRepository.ts
        schemas/
          permitSchema.ts
        types/
          permitTypes.ts

      master/
        shared/
          components/
            MasterFormBase.tsx
            MasterListBase.tsx
            MasterDetailBase.tsx
            MasterValidityChip.tsx
          helpers/
            masterValidity.ts
            masterFormActionState.ts
            masterFormData.ts
            masterFormValue.ts
            masterRepositoryError.ts
          mappers/
            masterCommonMapper.ts
          repositories/
            masterCrudRepository.ts
          schemas/
            masterCommonSchema.ts
          types/
            masterCommonTypes.ts
            masterFormActionState.ts

      attachments/
        shared/
          repositories/
            attachmentRepository.ts
            attachmentLinkRepository.ts
            attachmentViewRepository.ts
          types/
            attachmentTypes.ts
            attachmentUiTypes.ts

packages/
  ui/
    form/
      AttachmentUploader.tsx
      file/
        PreviewGrid.tsx
        PreviewLightbox.tsx
        types.ts
  lib/
    file/
      compressImage.ts
      pdfToThumbnail.ts
```

---

# 6. monorepo 前提の共通化ルール

## packages/ui
- UI コンポーネントのみ
- 各システム固有の型を知らない
- ジェネリック + adapter props で受ける

## 各システム側
- AttachmentFormItem などの業務型を持つ
- wrapper コンポーネントを薄く置く
- toPreviewItem や createItemFromUploadResult を定義する

## 方針
- UI は共通
- データ shape は各システム側
- packages/ui が features 配下を import しない

---

# 7. 別プロジェクトで再利用する時のおすすめ構築順

## Step 1. CRUD 一式
- DDL
- repository
- schema
- Form
- action
- list / detail
- current staff 補完

## Step 2. マスタ管理
- masterCommon 系 shared
- 1本目のマスタ
- 業務フォームの自由入力を xxxId へ寄せる

## Step 3. 添付ファイル
- attachments
- attachment_links
- presign / register / view-url
- cleanup
- thumbnail
- 共通 AttachmentUploader

## Step 4. 通知 / リマインダ
- reminders
- 個別日付
- due / alert
- view / helper による状態算出

## Step 5. 検索 / 絞り込み
- 検索UI
- URL クエリ
- page.tsx searchParams
- repository 条件反映
- 必要なら後で一覧条件保存

## Step 6. コメント / メモ / 履歴
- target_type / target_id
- attachment_links 再利用

## Step 7. 監査ログ
- actor
- action
- summary
- metadata

---

# 8. 次にやるとよいこと

今の進捗を踏まえると、次に進めやすい候補は以下。

1. コメント / メモ / 履歴
2. 監査ログ
3. 検索 / 絞り込み の一覧条件保存
4. ステータス遷移

---

# 9. 引き継ぎ時の注意

このプロジェクトは、同じプロジェクト内の過去会話に強く依存している。
そのため、新しい会話に移る場合も、必ず次を前提として引き継ぐこと。

- 同じプロジェクト内の過去会話・設計方針・命名・責務分離を正確に参照すること
- permits を題材に育ててきたテンプレ資産の流れを崩さないこと
- login_user 1 : staff 多、selected_staff_id cookie、current staff ベースの運用を維持すること
- assets の添付は非公開バケット前提、GET 署名URL前提で扱うこと
- 検索 / 絞り込みは URL クエリベースで進めており、一覧条件保存はまだ未着手であること
- 「先に完全汎化しすぎない、ただし再利用しやすいように薄く共通化する」という方針を維持すること

---

# 10. 引き継ぎプロンプト

以下を新しい会話にそのまま貼る。

---

あなたは、日本企業向け業務システム
（Next.js App Router + TypeScript + MUI + Supabase + R2）
の開発アシスタントです。

私は、業務システム向けに再利用できるテンプレ資産を 10 個作る計画を進めています。
今後もこの方針を前提に、最後まで伴走してください。

【重要】
この会話は、同じプロジェクト内の過去会話の続きです。
同じプロジェクト内の過去会話・設計方針・命名・責務分離を必ず正確に参照し、
過去の会話内容も前提にして引き継いでください。
この「同じプロジェクトの過去会話からも正確に引き継ぐこと」は必須です。

【現在かなり進んでいるテンプレ資産】
1. CRUD 一式
2. マスタ管理
3. 添付ファイル
4. 通知 / リマインダ
5. 検索 / 絞り込み / 一覧条件保存
   - ただし「一覧条件保存」は未着手
   - 「検索 / 絞り込み」まで進行済み

【今後のおすすめ優先順位】
1. CRUD 一式
2. マスタ管理
3. 添付ファイル
4. 通知 / リマインダ
5. 検索 / 絞り込み / 一覧条件保存
6. コメント / メモ / 履歴
7. 監査ログ
8. ステータス遷移
9. 論理削除と復元
10. エクスポート

【既存方針】
- permits を題材にテンプレを育てている
- login_user 1 : staff 多
- selected_staff_id cookie を使って current staff を server 側で解決
- created_by / updated_by / 監査系は current staff ベース
- マスタ管理は is_active ではなく valid_at / invalid_at を標準採用
- 添付は attachments + attachment_links の構成
- 添付バケットは非公開前提
- 表示は GET 署名URL
- create 直後のプレビューは blob URL
- thumbnail も R2 保存する方針
- orphan attachment cleanup は active な attachment_links が無いものを削除対象にする
- 検索 / 絞り込みは URL クエリベースで進めている
- 先に完全汎化しすぎず、薄く共通化する方針

【今後やりたいこと】
次の優先候補は以下です。
- コメント / メモ / 履歴
- 監査ログ
- 検索 / 絞り込み の一覧条件保存
- ステータス遷移

まずは、現在地点を踏まえて、
どこまでテンプレ化済みかを簡潔に確認した上で、
次に進める実装順を提案してください。
