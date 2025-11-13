Supabase 角色#
Postgres 自帶一組預訂角色。 Supabase 在此基礎上擴展了一組預設角色，這些角色會在您啟動新專案時配置到資料庫中：

postgres#
預設的Postgres角色。該角色擁有管理員權限。

anon#
用於未經身份驗證的公共存取。這是 API（PostgREST）在使用者未登入時將使用的角色。

authenticator#
API（PostgREST）的特殊角色。它的存取權限非常有限，用於驗證 JWT，然後「切換」為由 JWT 驗證結果確定的另一個角色。

authenticated#
對於“已認證存取”，這是 API（PostgREST）在使用者登入時將使用的角色。

service_role#
授予更高存取權限。此角色由 API (PostgREST) 用於繞過行級安全性限制。

supabase_auth_admin#
由身份驗證中間件用於連接資料庫並運行遷移。存取權限限定在auth特定模式內。

supabase_storage_admin#
由身份驗證中間件用於連接資料庫並運行遷移。存取權限限定在storage特定模式內。

dashboard_user#
用於透過 Supabase UI 運行命令。

supabase_admin#
Supabase 內部用於執行管理任務的角色，例如執行升級和自動化。