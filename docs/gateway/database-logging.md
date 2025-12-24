# データベースロギング

## 概要

ML Gateway は PostgreSQL データベースを使用して、すべてのチャットリクエストとレスポンスをログに記録します。これにより、モデルの挙動を追跡し、分析することができます。

## データベーススキーマ

### ChatLog テーブル

すべてのチャットインタラクションを記録するメインテーブル:

| カラム名 | 型 | 説明 |
|---------|-------|-------------|
| id | TEXT (CUID) | 一意な識別子 |
| createdAt | TIMESTAMP | リクエスト受信時刻 |
| prompt | TEXT | ユーザーからのプロンプト |
| model | TEXT | 使用されたモデル名 |
| response | TEXT (nullable) | モデルからのレスポンス |
| duration | INTEGER (nullable) | 処理時間（ミリ秒） |
| error | TEXT (nullable) | エラーメッセージ（エラー時のみ） |

インデックス: `createdAt` カラムにインデックスを作成し、時系列での検索を高速化

## 設定

### 環境変数

データベース接続には `DATABASE_URL` 環境変数が必要です:

```bash
DATABASE_URL="postgresql://username:password@host:port/database"
```

### Docker Compose での設定

`infra/docker/compose.yml` では PostgreSQL サービスが自動的に設定されます:

```yaml
services:
  postgres:
    image: postgres:17-alpine
    environment:
      - POSTGRES_USER=hazumu
      - POSTGRES_PASSWORD=hazumu
      - POSTGRES_DB=hazumu
    ports:
      - "5432:5432"
```

Gateway サービスは自動的に `DATABASE_URL` 環境変数を設定します。

## マイグレーション

### 初回セットアップ

Docker コンテナ起動時、自動的にマイグレーションが実行されます。

### 手動マイグレーション

開発環境で手動でマイグレーションを実行する場合:

```bash
cd apps/ml-gateway
pnpm prisma:migrate
```

## データベース管理

### Prisma Studio

Prisma Studio を使用してデータベースを GUI で確認・編集できます:

```bash
cd apps/ml-gateway
pnpm prisma:studio
```

ブラウザで `http://localhost:5555` にアクセスします。

### SQL クエリ例

最新の 10 件のログを取得:

```sql
SELECT * FROM chat_logs 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

エラーが発生したログのみを取得:

```sql
SELECT * FROM chat_logs 
WHERE error IS NOT NULL 
ORDER BY "createdAt" DESC;
```

モデル別の平均処理時間:

```sql
SELECT model, 
       AVG(duration) as avg_duration_ms,
       COUNT(*) as request_count
FROM chat_logs 
WHERE duration IS NOT NULL
GROUP BY model;
```

## ロギング動作

### 成功時のログ

リクエストが正常に処理された場合、以下の情報がログに記録されます:

- プロンプト
- 使用されたモデル
- モデルのレスポンス
- 処理時間（ミリ秒）

### エラー時のログ

リクエストがエラーで失敗した場合、以下の情報がログに記録されます:

- プロンプト
- 使用されたモデル
- エラーメッセージ
- エラーまでの処理時間

### ロギング失敗のハンドリング

データベースへのロギングが失敗しても、API リクエストは失敗しません。ロギングエラーはコンソールに出力されますが、クライアントには影響しません。

## 注意事項

- データベースログには機密情報（プロンプトやレスポンス）が含まれる可能性があります。適切なアクセス制御を設定してください。
- 大量のトラフィックがある場合、定期的に古いログを削除またはアーカイブすることを検討してください。
- 本番環境では、データベースのバックアップを定期的に実行してください。
