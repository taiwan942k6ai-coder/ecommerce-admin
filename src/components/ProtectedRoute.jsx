import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null) // null 代表還在確認中

  useEffect(() => {
    // 還記得我們上一章提到 Supabase 會自動幫我們管理儲存在 Cookie/localStorage 的憑證嗎？
    // 我們在這裡直接向 Supabase 詢問：「目前瀏覽器裡有沒有有效的 Session（對話憑證）？」
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setIsAuthenticated(true)  // 有憑證，驗證通過！
      } else {
        setIsAuthenticated(false) // 沒憑證，驗證失敗！
      }
    }

    checkAuth()

    // 額外保險：監聽登入狀態的即時改變（例如憑證過期、或使用者在別處登出）
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 1. 因為檢查 Supabase 憑證需要一點點時間（非同步），在結果出來前，顯示載入中畫面
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse text-sm font-medium">安全檢查中...</div>
      </div>
    )
  }

  // 2. 如果沒登入，使用 <Navigate /> 強制重導向到登入頁，並記錄他原本想去哪裡（replace）
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 3. 驗證通過，放行！渲染被包裹的子組件（例如 Dashboard 或 StoreManage）
  return children
}