# Supabase 核心架構重構與實作藍圖

本文檔旨在記錄 Newsio 專案從混合架構轉向以 Supabase 為核心的正式應用架構的詳細執行計劃。

## 核心目標

1.  **架構統一**：確立「Supabase 作為核心後端」的架構，統一後端邏輯與資料儲存。
2.  **身份授權**：實現基於 Supabase Auth 的身份驗證與授權，確保資料存取安全。
3.  **邏輯分離**：將核心業務邏輯（如使用者行為記錄）從 App 端分離，移至安全的後端環境 (Edge Functions) 執行。
4.  **模型擴展**：建立可擴展的資料模型與事件處理機制，以適應未來的功能需求。

---

## 修訂版執行計劃

### 步驟一：使用者資料遷移與統一 (User Data Migration)

此步驟旨在解決 `public.users` 與 `auth.users` 的不一致問題，將使用者資料統一到 Supabase Auth。

**1. 為 `auth.users` 新增自訂欄位**:
Supabase Auth 使用者有一個名為 `raw_user_meta_data` 的 `jsonb` 欄位，專門用來儲存自訂資訊。我們將把 `public.users` 的 `personalization_weight` 和 `status` 欄位存放在這裡。

**2. 執行資料遷移腳本**:
**警告：在執行任何修改前，請務必備份您的資料庫！**
在 Supabase SQL Editor 中，執行以下腳本來遷移資料。

```sql
-- 建立一個暫時的 PL/pgSQL 函式來執行遷移
CREATE OR REPLACE FUNCTION migrate_user_data()
RETURNS void AS $$
DECLARE
    rec RECORD;
BEGIN
    -- 遍歷 public.users 中的每一筆記錄
    FOR rec IN SELECT * FROM public.users LOOP
        -- 更新 auth.users 中 email 相符的用戶
        UPDATE auth.users
        SET
            raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
                'status', rec.status,
                'personalization_weight', rec.personalization_weight
            )
        WHERE
            email = rec.email;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 執行遷移函式
SELECT migrate_user_data();

-- 刪除暫時函式
DROP FUNCTION migrate_user_data;
```

**3. 更新所有相關表格的外鍵**:
將所有指向 `public.users` 的外鍵，全部改為指向 `auth.users`。

```sql
-- article_sentiments
ALTER TABLE public.article_sentiments DROP CONSTRAINT IF EXISTS article_sentiments_user_id_fkey;
ALTER TABLE public.article_sentiments ADD CONSTRAINT article_sentiments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- article_collections
ALTER TABLE public.article_collections DROP CONSTRAINT IF EXISTS article_collections_user_id_fkey;
ALTER TABLE public.article_collections ADD CONSTRAINT article_collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- article_shares
ALTER TABLE public.article_shares DROP CONSTRAINT IF EXISTS article_shares_user_id_fkey;
ALTER TABLE public.article_shares ADD CONSTRAINT article_shares_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- user_author_subscriptions
ALTER TABLE public.user_author_subscriptions DROP CONSTRAINT IF EXISTS user_author_subscriptions_user_id_fkey;
ALTER TABLE public.user_author_subscriptions ADD CONSTRAINT user_author_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- user_source_subscriptions
ALTER TABLE public.user_source_subscriptions DROP CONSTRAINT IF EXISTS user_source_subscriptions_user_id_fkey;
ALTER TABLE public.user_source_subscriptions ADD CONSTRAINT user_source_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- user_topic_subscriptions
ALTER TABLE public.user_topic_subscriptions DROP CONSTRAINT IF EXISTS user_topic_subscriptions_user_id_fkey;
ALTER TABLE public.user_topic_subscriptions ADD CONSTRAINT user_topic_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

**4. 移除 `public.users` 表格**:
在確認所有關聯都已更新且資料無誤後，安全地移除舊表格。
```sql
DROP TABLE public.users;
```

### 步驟二：精煉資料庫安全策略 (RLS)

設定更明確、更安全的行級安全 (Row-Level Security) 規則。

```sql
-- 啟用 RLS (如果尚未啟用)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_sentiments ENABLE ROW LEVEL SECURITY;

-- 清除 articles 上可能存在的舊策略
DROP POLICY IF EXISTS "Allow public read access to articles" ON public.articles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.articles;

-- 建立 articles 的新讀取策略
-- 規則：明確允許 anon (匿名) 和 authenticated (已登入) 角色讀取
CREATE POLICY "Allow read access to anon and authenticated users"
ON public.articles
FOR SELECT
TO anon, authenticated
USING (true);
-- 備註：因為沒有為 INSERT, UPDATE, DELETE 定義策略，所以這些操作對 anon 和 authenticated 預設是禁止的。

-- article_sentiments 的策略
DROP POLICY IF EXISTS "Users can read their own sentiments" ON public.article_sentiments;
CREATE POLICY "Users can read their own sentiments"
ON public.article_sentiments
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own sentiments" ON public.article_sentiments;
CREATE POLICY "Users can manage their own sentiments"
ON public.article_sentiments
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### 步驟三：建立可擴展的後端事件處理 (Generic Edge Function)

建立一個通用的 Edge Function 來處理所有使用者行為事件，以應對高併發和多事件類型的需求。

**1. 建立 Edge Function**:
```bash
supabase functions new record-user-event
```

**2. 撰寫通用 Function 程式碼**:
將以下程式碼貼入 `supabase/functions/record-user-event/index.ts`。

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 定義事件類型和對應的資料結構
type UserEvent =
  | { eventType: 'sentiment'; payload: { article_id: string; sentiment: 'like' | 'dislike' } }
  | { eventType: 'collection'; payload: { article_id: string; folder_id?: string } }
  | { eventType: 'search'; payload: { query: string; result_count: number } };

// 處理 CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const userClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { eventType, payload }: UserEvent = await req.json();

    switch (eventType) {
      case 'sentiment':
        await supabaseAdmin.from('article_sentiments').upsert({
          user_id: user.id,
          article_id: payload.article_id,
          sentiment: payload.sentiment,
          updated_at: new Date().toISOString()
        });
        break;

      case 'collection':
        // 假設：如果已收藏，則不處理。未來可擴展為取消收藏。
        await supabaseAdmin.from('article_collections').insert({
          user_id: user.id,
          article_id: payload.article_id,
          folder_id: payload.folder_id || null
        });
        break;
      
      case 'search':
        // 搜尋事件可以記錄到一個新表，例如 user_searches
        // await supabaseAdmin.from('user_searches').insert({ ... });
        console.log(`User ${user.id} searched for: "${payload.query}"`);
        break;

      default:
        throw new Error('Invalid event type');
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
```

**3. 部署 Function**:
```bash
supabase functions deploy record-user-event --no-verify-jwt
```

### 步驟四：Mobile App 實作調整

App 現在只需要呼叫一個統一的端點來記錄所有事件。

在 `NewsfeedScreen.tsx` 或其他需要記錄事件的地方：

```typescript
// 引入 supabase client
import { supabase } from '../lib/supabase';

// 範例 1：在 onSwipe 中記錄「喜歡/不喜歡」
const onSwipe = async (direction: SwipeDirection) => {
  // ...
  const sentimentToRecord = direction === 'right' ? 'like' : 'dislike';
  await supabase.functions.invoke('record-user-event', {
    body: {
      eventType: 'sentiment',
      payload: {
        article_id: active.id,
        sentiment: sentimentToRecord,
      },
    },
  });
  // ...
};

// 範例 2：在某個按鈕點擊後記錄「收藏」
const handleCollectArticle = async (articleId: string) => {
  await supabase.functions.invoke('record-user-event', {
    body: {
      eventType: 'collection',
      payload: {
        article_id: articleId,
      },
    },
  });
};
```
