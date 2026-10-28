import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient' // 請確保你的 supabase 引入路徑正確

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // 安全檢查：確保用戶是點擊信箱連結進來的（帶有 Supabase 的驗證狀態）
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('無效的或過期的存取連結，請重新至登入頁點選忘記密碼。')
      }
    }
    checkSession()
  }, [])

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    // 密碼一致性檢查
    if (newPassword !== confirmPassword) {
      setError('兩次輸入的密碼不相同')
      return
    }

    if (newPassword.length < 6) {
      setError('密碼長度至少需要 6 個字元')
      return
    }

    setLoading(true)

    // 呼叫 Supabase API 更新當前登入用戶的密碼
    const { error } = await supabase.auth.updateUser({ 
      password: newPassword 
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setMessage('密碼重設成功！3 秒後將為您跳轉至登入頁面...')
      // 成功後清除輸入框，並於 3 秒後導回登入頁
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        navigate('/login') // 請根據你的登入頁路由調整
      }, 3000)
    }
  }

  return (
    <div className="flex h-dvh w-full items-center justify-center p-4 bg-slate-50 overflow-hidden">
      <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">重設您的密碼</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          請輸入您的新密碼，並務必妥善保存。
        </p>

        {/* 錯誤訊息 */}
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>}
        
        {/* 成功訊息 */}
        {message && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4">{message}</div>}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新密碼</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              required 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" 
              placeholder="請輸入新密碼（至少6碼）"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">確認新密碼</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" 
              placeholder="請再次輸入新密碼"
              autoComplete="new-password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !!message}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition duration-200 text-base shadow-sm disabled:opacity-50"
          >
            {loading ? '更新中...' : '儲存新密碼'}
          </button>
        </form>
      </div>
    </div>
  )
}