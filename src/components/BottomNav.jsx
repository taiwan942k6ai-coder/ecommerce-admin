import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  // 判斷目前網址在老家，用來高亮顯示對應的按鈕
  const isActive = (path) => {
    // 如果是 store 頁面，因為後面帶有 ID，我們用開頭來判斷
    if (path === '/store' && location.pathname.startsWith('/store')) return true
    return location.pathname === path
  }

  return (
    // <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/90 backdrop-blur-md pb-safe-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
    //   <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {/* 確保背景是不透明或高飽和模糊，內距適應手機底部 */}{/* 底下是按鈕們 ... */}  
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2 pb-safe">

        {/* 按鈕 1：商店總覽 */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center justify-center w-20 h-full transition-colors active:scale-95 ${
            isActive('/dashboard') ? 'text-brand-600 font-semibold' : 'text-slate-400'
          }`}
        >
          <span className="text-xl mb-0.5">🏪</span>
          <span className="text-[11px]">商店總覽</span>
        </button>

        {/* 按鈕 2：目前商店 (若沒進入特定商店則導回總覽) */}
        <button
          onClick={() => {
            // 如果本來就在某個商店頁面就不動，否則去總覽
            if (!location.pathname.startsWith('/store')) {
              navigate('/dashboard')
            }
          }}
          className={`flex flex-col items-center justify-center w-20 h-full transition-colors active:scale-95 ${
            location.pathname.startsWith('/store') ? 'text-brand-600 font-semibold' : 'text-slate-400'
          }`}
        >
          <span className="text-xl mb-0.5">📦</span>
          <span className="text-[11px]">商品設定</span>
        </button>

        {/* 按鈕 3：登出 / 帳戶設定 */}
        <button
          onClick={async () => {
            if (confirm('確定要登出系統嗎？')) {
              const { supabase } = await import('../supabaseClient')
              await supabase.auth.signOut()
              navigate('/login')
            }
          }}
          className="flex flex-col items-center justify-center w-20 h-full text-slate-400 active:scale-95"
        >
          <span className="text-xl mb-0.5">🚪</span>
          <span className="text-[11px]">安全登出</span>
        </button>

      </div>
    </nav>
  )
}