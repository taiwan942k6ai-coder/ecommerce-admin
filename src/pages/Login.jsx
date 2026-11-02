import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null) // 新增：用於顯示成功發送重設信件的提示
  const [loading, setLoading] = useState(false) // 新增：防止重複點擊
  const navigate = useNavigate()

  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  // 📱 行動端優化：點擊頁面其他地方時，自動關閉提示框
  useEffect(() => {
    function handleClickOutside(event) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 📱 行動端點擊切換
  const handleIconClick = (e) => {
    e.preventDefault();  // 防止瀏覽器把點擊問號當作表單提交
    e.stopPropagation(); // 防止事件冒泡觸發其他的點擊事件
    setShowTooltip(!showTooltip);
  };



  const handleLogin = async (e) => {
    e.preventDefault()// 在 HTML 中，表單（<form>）提交時預設會重新整理網頁。這行程式碼可以阻止網頁重新整理
    setError(null)
    setMessage(null)
    setLoading(true)
    
    // 呼叫 Supabase 登入。成功後，憑證會自動被 SDK 塞進瀏覽器儲存空間！(local?cookie?)
    const { error } = await supabase.auth.signInWithPassword({ email, password })    

    setLoading(false)
    if (error) {  setError(error.message)
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
    if (error) { setError(error.message)
    } else {
      setMessage('密碼重設信件已發送！請至您的信箱查看連結。')
    }
  }



  // 新增：註冊新帳號邏輯
const handleSignUp = async (e) => {
  e.preventDefault() // 阻止表單重新整理
  setError(null)
  setMessage(null)
  setLoading(true)

  // 核心：呼叫 Supabase 的 signUp API 創立帳號
  const { data, error } = await supabase.auth.signUp({ email, password })

  setLoading(false)
  if (error) {
    setError(error.message)
  } else {
    // 成功註冊後的提示
    setMessage('註冊成功！您將在3秒內自動登入。')
    // 如果您在 Supabase 後台已經把 "Confirm Email" 關掉了，這裡可以直接導向後台：
    setTimeout(() => navigate('/dashboard'), 2000)
  }
}



return (
  <div className="flex flex-col h-dvh w-full items-center justify-center p-4 bg-slate-50 overflow-hidden">
    {/* 2. 上方隱形推手（佔 1 等份空間） */}
    <div className="flex-[1]" />

    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-md border border-slate-100">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">商店管理系統</h2>
      {/* <p className="text-sm text-gray-500 text-center mb-6 whitespace-pre-line">
        註冊後，可直接創建商店。{"\n"}
        需等 48hr，由管理者審核後才會出現在用戶版 APP{"\n"}
        (目前沒有審核機制，創了前端就會直接看到)
      </p> */}
      <p className="text-sm text-gray-500 text-center mb-6 whitespace-pre-line">
      第一次使用市集小幫手需先註冊帳戶{"\n"}<br />
      註冊帳戶流程：{"\n"}
      先輸入 '信箱' 和 '密碼' ，再按 '註冊新帳戶' 按鈕
      </p>

      {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm mb-4 border border-red-100">{error}</div>}
      {message && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm mb-4 border border-green-100">{message}</div>}

      <form onSubmit={handleLogin} className="space-y-4">
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">信箱</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-base transition-all" 
            placeholder="name@example.com" 
            autoComplete="email"/>
        </div> */}
      <div className="flex flex-col">
      <div className="flex items-start mb-2">{/* 標題與問號容器 */}
        <label className="block text-sm font-medium text-gray-700 mb-1">信箱</label>
        <span 
          ref={tooltipRef}
          className="relative inline-flex items-center justify-center w-3.5 h-3.5 ml-0.5 -mt-0.5 text-[10px] font-bold text-white bg-amber-400 rounded-full cursor-help select-none"
          onMouseEnter={() => setShowTooltip(true)}  /* PC 滑鼠移入 */
          onMouseLeave={() => setShowTooltip(false)} /* PC 滑鼠移出 */
          onClick={handleIconClick}                  /* 📱 手機點擊觸發 */    >
          ?   {/* 右上角小黃色問號圖標 */}
          {showTooltip && (
            // <div className="absolute bottom-[160%] left-1/2 -translate-x-1/2 z-50 px-3 py-2 text-xs font-normal leading-normal text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap">
              /* 修正後的提示文字浮動視窗：移除 left-1/2 和 -translate-x-1/2，改用 left-0 靠左對齊，並限制寬度與允許換行 */
            <div className="absolute bottom-[160%] left-0 z-50 w-64 p-3 text-xs font-normal leading-normal text-white bg-gray-800 rounded-md shadow-lg break-words">
            目前不提供更換郵箱功能，若輸入錯誤，<br />可以註銷帳戶，再重新註冊新帳號。    {/* 提示文字浮動視窗 */} {/* 提示框底部的小三角形箭頭 */}
            {/* <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-solid border-t-gray-800 border-x-transparent border-b-transparent"></div> */}
            {/* 修正後的小三角形箭頭：讓箭頭精準靠左對齊黃色問號 */}
            <div className="absolute top-full left-1 border-[5px] border-solid border-t-gray-800 border-x-transparent border-b-transparent"></div>
          </div>
          )}
        </span>
      </div>

      {/* 輸入框 */}
      <input 
        type="email" value={email  ?? ''} onChange={e => setEmail(e.target.value)} required autoComplete="email"
        className="w-full max-w-[400px] p-3 text-base border border-gray-200 rounded-lg outline-none placeholder:text-gray-400 focus:border-blue-500" 
        placeholder="name@example.com" 
      />
    </div>




        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
          <input 
            type="password" 
            value={password  ?? ''} 
            onChange={e => setPassword(e.target.value)} 
            required 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-base transition-all" 
            placeholder="••••••••" 
            autoComplete="current-password"
          />
        </div>

        {/* 忘記密碼與註冊按鈕區塊 - 調整為精緻的文字連結 */}
        <div className="flex justify-between items-center px-0.5 text-sm">
          <button 
            type="button" 
            onClick={handleForgotPassword} 
            disabled={loading} 
            className="text-gray-500 hover:text-blue-600 hover:underline focus:outline-none transition-colors disabled:opacity-50"
          >
            忘記密碼？
          </button>
          
          <button 
            type="button" 
            onClick={handleSignUp} 
            disabled={loading} 
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline focus:outline-none transition-colors disabled:opacity-50"
          >
            註冊新帳號
          </button>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition duration-200 text-base shadow-sm mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          登入市集後台
        </button>
      </form>
    </div>

    {/* 下方隱形推手（佔 3 等份空間） */}
    <div className="flex-[3]" />
  </div>
);




  return (
    // <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4">
    <div className="flex flex-col h-full w-full items-center justify-center p-4 bg-slate-50 overflow-hidden">
      {/* 用 h-dvh 頂天立地，用 overflow-hidden 拔掉滾動條  items-center改flex-col*/} {/* 底下登入表單卡片... */}
      {/* <!-- 2. 上方隱形推手（佔 2 等份空間） --> */}
      <div className="flex-[1]" />
      <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {/* <img className="" src="/市集小幫手.jpg"  alt="市集小幫手 LOGO" style={{ width: '200px', height: 'auto' }} /> */}
        {/* <img className="mx-auto block w-[200px] h-auto" src="/市集小幫手.jpg" alt="市集小幫手 LOGO" /> */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">攤販後台管理系統</h2>
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
          <div className='flex justify-between items-center mb-4'>
          <button   type="button"       onClick={handleForgotPassword}
                    disabled={loading}  className="text-sm text-blue-600 hover:text-blue-700 hover:underline focus:outline-none disabled:opacity-50">
            忘記密碼？
          </button>{/* 新增的註冊按鈕 */}
          <button type="button" onClick={handleSignUp} disabled={loading} className="ml-2 bg-green-500 text-white">
            註冊新帳號
          </button>
          </div>
        </form>
      </div>
      <div className="flex-[3]" />
    </div>
  )
}