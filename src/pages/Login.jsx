import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null) // 新增：用於顯示成功發送重設信件的提示
  const [loading, setLoading] = useState(false) // 新增：防止重複點擊
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()// 在 HTML 中，表單（<form>）提交時預設會重新整理網頁。這行程式碼可以阻止網頁重新整理
    setError(null)
    setMessage(null)
    setLoading(true)
    
    // 呼叫 Supabase 登入。成功後，憑證會自動被 SDK 塞進瀏覽器儲存空間！(local?cookie?)
    const { error } = await supabase.auth.signInWithPassword({ email, password })    

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {    // 成功後跳轉至商店總覽頁面
      navigate('/dashboard')
    }
  }

  // 忘記密碼邏輯
  const handleForgotPassword = async () => {
    if (!email) {
      setError('請先輸入您的註冊信箱，再點選忘記密碼')
      return
    }

    setError(null)
    setMessage(null)
    setLoading(true)

    // 呼叫 Supabase 發送重設密碼信件
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // redirectTo: 這是用戶點擊信箱連結後要跳轉的頁面，請確保該路徑在 Supabase 後台的 Redirect URLs 有設定
      redirectTo: `${window.location.origin}/reset-password`, 
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setMessage('密碼重設信件已發送！請至您的信箱查看連結。')
    }
  }

  return (
    // <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4">
    <div className="flex h-dvh w-full items-center justify-center p-4 bg-slate-50 overflow-hidden">
      {/* 用 h-dvh 頂天立地，用 overflow-hidden 拔掉滾動條 */} {/* 底下登入表單卡片... */}
      
      <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">市集小幫手  後台管理系統</h2>
        <p className="text-sm text-gray-500 text-center mb-6 whitespace-pre-line">註冊後，可直接創建商店。{"\n"}需等48hr，由管理者審核後才會出現在 用戶版APP<br /></p>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>}
        {/* 成功重設提示訊息 */}
        {message && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4">{message}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">註冊信箱</label>
            <input  type="email" value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" 
                    placeholder="my_email_address@mail.com" autoComplete="current-password"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
            <input  type="password" value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" 
                    placeholder="••••••••" autoComplete="current-password"/>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition duration-200 text-base shadow-sm">
            登入市集後台
          </button>
          <button   type="button"       onClick={handleForgotPassword}
                    disabled={loading}  className="text-sm text-blue-600 hover:text-blue-700 hover:underline focus:outline-none disabled:opacity-50">
            忘記密碼？
          </button>
        </form>
      </div>
    </div>
  )
}