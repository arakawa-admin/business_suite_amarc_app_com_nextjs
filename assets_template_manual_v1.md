# 業務システム向けテンプレ資産マニュアル
## 対象
Next.js App Router + TypeScript + MUI + Supabase を使った、日本企業向け業務システムの再利用テンプレ資産。

## このマニュアルで扱う範囲
ここでは、先行して整備した以下 3 つをまとめる。

1. CRUD 一式
2. マスタ管理
3. 添付ファイル

---

# 1. 全体方針

## 1-1. テンプレ資産化の目的
目的は、毎回ゼロから実装せず、業務システムでよく出る構成を安全に横展開できるようにすること。

重視することは次の通り。

- 画面ごとの実装パターンをそろえる
- repository / schema / form / action の責務を分ける
- DB は事実を持ち、表示状態は view や helper で解決する
- 監査系の値は client から受けず、server 側で補完する
- 先に汎化しすぎず、薄い共通化に寄せる

## 1-2. 推奨構築順
別プロジェクトで再利用する場合は、次の順番がよい。

1. CRUD 一式
2. マスタ管理
3. 添付ファイル

### なぜこの順番か
- CRUD 一式が土台になる
- マスタ管理は CRUD の流儀をそのまま再利用できる
- 添付ファイルは CRUD と current staff の流れが固まってからの方が実装しやすい

---

# 2. 推奨ディレクトリ構成

最初は細かく分けすぎない。増えてから分ける。

```txt
src/
  app/
    (authorized)/
      assets/
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
      assets/
        attachments/
          presign/route.ts
          register/route.ts
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

        permit-categories/
          actions/
            createPermitCategoryAction.ts
            updatePermitCategoryAction.ts
          components/
            PermitCategoryForm.tsx
            PermitCategoryList.tsx
            PermitCategoryDetail.tsx
          repositories/
            permitCategoryRepository.ts
          schemas/
            permitCategorySchema.ts
          types/
            permitCategoryTypes.ts

      attachments/
        shared/
          components/
            AttachmentUploader.tsx
          repositories/
            attachmentRepository.ts
            attachmentLinkRepository.ts
          types/
            attachmentTypes.ts
```

---

# 3. テンプレ資産 1: CRUD 一式

## 3-1. 目的
業務レコードの一覧・詳細・新規作成・編集・論理削除の基本パターンを統一する。

## 3-2. 標準責務
### app
- page.tsx で server fetch
- UI コンポーネントにデータを渡す

### components
- Form
- List
- Detail

### schemas
- zod による入力検証
- form values と submit values の型をここから作る

### repositories
- Supabase との入出力
- snake_case / camelCase の変換
- DB 操作の集約

### actions
- schema 検証
- current staff 補完
- repository 呼び出し
- revalidate / redirect

## 3-3. CRUD の標準ルール
- 監査列は client から受けない
- created_by / updated_by は server 側で current staff を入れる
- 一覧表示用の状態は DB 列に持たず、view / helper で算出する
- 論理削除は deleted_at / deleted_by を基本にする
- repository は DB 操作に寄せ、業務判断は action か use case 側に寄せる

## 3-4. current staff の扱い
現在の前提は以下。

- login_user 1 : staff 多
- selected_staff_id cookie を使う
- server 側で current staff を解決する
- created_by / updated_by / 監査ログは current staff ベースで扱う

### 推奨
- currentStaffRepository を用意する
- action または use case で currentStaff を取得する
- repository に completed input を渡す

## 3-5. CRUD を別案件へ移す時の順番
1. テーブル DDL
2. repository
3. zod schema
4. Form
5. create / update action
6. List / Detail
7. app router ページ
8. view や一覧用 mapper

---

# 4. テンプレ資産 2: マスタ管理

## 4-1. 方針
マスタ管理テンプレでは `is_active` よりも、以下を標準採用する。

- valid_at timestamptz null
- invalid_at timestamptz null

現在有効かどうかは helper / repository / view で判定する。

## 4-2. 標準カラム
- id
- code
- name
- sort_order
- remarks
- valid_at
- invalid_at
- created_at
- updated_at

### 原則
- テンプレ標準には is_active を入れない
- マスタは削除より無効化を基本にする
- 業務入力画面では active のみ候補表示
- 管理画面一覧では全件表示

## 4-3. マスタ共通 helper
### validity 判定
状態は次の 3 つ。

- upcoming
- active
- expired

### 判定ルール
- valid_at が未来 → upcoming
- invalid_at が過去以前 → expired
- それ以外 → active

## 4-4. マスタ管理テンプレの共通化方針
やりすぎず、薄い共通化に寄せる。

### shared に置くもの
- 共通型
- 共通 schema
- validity helper
- 共通 mapper
- 共通 CRUD repository
- 共通 FormBase
- 共通 ListBase
- 共通 DetailBase

### 個別に残すもの
- テーブル名
- 画面タイトル
- パス
- action 名
- 文言
- 将来の追加列

## 4-5. permit categories での適用例
### テーブル
- assets.master_permit_categories

### UI / repository
- PermitCategoryForm
- PermitCategoryList
- PermitCategoryDetail
- permitCategoryRepository

### action
- createPermitCategoryAction
- updatePermitCategoryAction

## 4-6. フォームの標準項目
- code
- name
- sortOrder
- remarks
- validAt
- invalidAt

## 4-7. Action の標準形
- useActionState を使う
- fieldErrors と formError を返す
- Server Action 内で zod 検証する
- DB エラーは formError に寄せる
- 成功時は revalidate / redirect

## 4-8. Permit 側との接続方針
分類は自由入力ではなくマスタ参照に寄せる。

### 推奨
- permitCategoryId を保存する
- UI は Select か freeSolo なし Autocomplete
- 候補の新規作成はマスタ管理画面で行う
- 業務入力画面からの自動マスタ登録は原則しない

---

# 5. テンプレ資産 3: 添付ファイル

## 5-1. 方針
添付ファイルテンプレは次の考え方で作る。

- 本体は R2
- DB は metadata only
- 業務レコードとは中間テーブルで関連付ける
- direct upload を標準とする
- server action に File 本体は渡さない
- ゴミファイル対策を最初から入れる

## 5-2. 推奨テーブル
### 本体
- assets.attachments

### 汎用関連
- assets.attachment_links

## 5-3. attachment_links を汎用化する理由
今後、permit 以外にも展開しやすい。

例:
- permit
- permit_renewal_log
- vehicle
- vehicle_insurance
- vehicle_inspection_log

## 5-4. attachment_links の基本列
- id
- attachment_id
- target_type
- target_id
- attachment_role
- sort_order
- created_at
- created_by
- updated_at
- deleted_at
- deleted_by

## 5-5. assets 側の共通定数
ファイルを増やしすぎないため、まずは 1 ファイルにまとめる。

### 例
`src/features/assets/shared/types/assetsDomainTypes.ts`

ここに以下を集約する。

- assetTargetTypes
- AssetTargetType
- attachmentRoles
- AttachmentRole

## 5-6. TypeScript の最小構成
- assetsDomainTypes.ts
- attachmentTypes.ts
- attachmentRepository.ts
- attachmentLinkRepository.ts
- AttachmentUploader.tsx

## 5-7. アップロードフロー
### 1. ファイル選択
- presign API を呼ぶ
- R2 に直接 PUT

### 2. upload 完了後
- attachments に metadata 登録
- この時点では linked_at = null

### 3. 業務保存成功時
- attachment_links を作る
- markAttachmentsLinked() を呼ぶ
- linked_at = now()

## 5-8. なぜ linked_at を持つのか
ファイル選択時に先にアップロードすると、未送信で閉じた場合に孤児ファイルが出る。

これを解決するために、attachments に

- linked_at timestamptz null

を持たせる。

### 意味
- linked_at is null: 仮アップロード
- linked_at is not null: 業務レコードに確定利用された

## 5-9. cleanup 方針
cleanup は user client ではなく、admin client / service role で動かす。

### 理由
- RLS に影響されない
- 管理バッチとして安定する
- ユーザー依存の挙動にならない

### cleanup 対象
- deleted_at is null
- linked_at is null
- uploaded_at または created_at が一定時間より古い

### 例
- 24時間以上未リンクの attachment を削除

### 実行方法
- internal cron API を作る
- CRON_SECRET で保護する
- Vercel Cron などから定期実行する

## 5-10. PermitForm への組み込み
添付は RHF に無理に載せず、最初は state 管理でよい。

### フォーム側
- `const [attachments, setAttachments] = useState<UploadedAttachmentItem[]>([])`
- submit 時に values と一緒に action に渡す

### action 側
- permit を保存
- attachment_links を作る
- linked_at を更新する

---

# 6. 別プロジェクトでの実装順マニュアル

## Step 1. CRUD 一式を通す
最初に 1 エンティティ分を最後まで通す。

### やること
- DDL
- repository
- schema
- Form
- create / update action
- list / detail
- page.tsx
- current staff 補完

### ここで確認すること
- created_by / updated_by が server で入る
- 一覧・詳細・新規・編集が通る
- 論理削除方針が決まっている

## Step 2. マスタ管理テンプレを作る
次に、CRUD の流儀を使ってマスタ管理を共通化する。

### やること
- masterCommonTypes
- masterCommonSchema
- masterValidity
- masterCrudRepository
- MasterFormBase
- MasterListBase
- MasterDetailBase
- 1本目のマスタを作る

### おすすめ
1本目は、そのプロジェクトで最も表記揺れしやすい分類系マスタから入る。

## Step 3. 業務フォームをマスタ参照に寄せる
- 自由入力を見直す
- 保存値を `xxxId` に寄せる
- 一覧表示は join / view で名前に戻す

## Step 4. 添付ファイルテンプレを入れる
CRUD と current staff が落ち着いてから添付に入る。

### やること
- attachments DDL
- attachment_links DDL
- attachmentRepository
- attachmentLinkRepository
- presign API
- register API
- AttachmentUploader
- create action で link 作成
- linked_at 更新
- cleanup API

## Step 5. cleanup を必ず入れる
添付テンプレは cleanup まで入れて完成。

### 最低限必要なもの
- linked_at
- markAttachmentsLinked()
- findStaleUnlinkedAttachments()
- hardDeleteAttachments()
- cron route
- admin client

---

# 7. 新規案件での設計判断ルール

## 7-1. 何でもすぐ共通化しない
- まず 1 本通す
- 2 本目で重複が見えたら shared 化する
- 先に完全汎化しすぎない

## 7-2. string 直書きを減らす
- target_type
- attachment_role
- reminder_type_code
- event_type_code

は const 配列 + type に寄せる

## 7-3. 業務入力からのマスタ自動登録は慎重に
分類系は原則、
- 管理画面で追加
- 業務画面では選択のみ

## 7-4. バッチ・cleanup は user client でやらない
- service role
- internal API
- cron secret

---

# 8. この3資産を入れた後の次の候補

ここまで整うと、次に進みやすいのは以下。

4. コメント / メモ / 履歴  
5. 通知 / リマインダ  
6. 監査ログ

理由は、今回作った基盤をそのまま再利用できるから。

- CRUD の流儀
- current staff
- target_type の考え方
- attachment_links
- action / repository 分離

---

# 9. 最後に

このマニュアルの核心は次の3つ。

- まず CRUD 一式を 1 本最後まで通す
- 次にマスタ管理を shared 化する
- 添付ファイルは R2 直アップロード + linked_at + cleanup まで入れて完成にする

この順で進めると、別プロジェクトでも迷いにくい。
