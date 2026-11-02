import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Store, ChevronRight, LogOut, Plus ,Minus, Trash2} from 'lucide-react'
import BottomNav from '../../components/BottomNav'


//(待處理)   現場照上傳 的頁面(點照片會連絡去)     上線目前都TRUE(有資訊管理者後再修改)

export default function Personal() {
  const { user } = useAuth()

  const [userName, setUserName] = useState('')
  const [userPersona, setUserPersona] = useState('')
  // const [userCreateTime, setUserCreateTime] = useState('')
  const [userAvatarUrl, setUserAvatarUrl] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [userAddress, setUserAddress] = useState('')

  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const todayUTCString = new Date().toISOString().split('T')[0];
  console.log("目前要測試的變數是  todayUTCString：", todayUTCString);
  
  useEffect(() => {
    console.log("目前要測試的變數是  user：", user);
    fetchUserInfo()
  }, [user])





  const handleUpdateUserInfo = async (e) => {
    e.preventDefault()
    try {//eq('name', storeName)應該改成uid，但我還在思考要不要讓攤販換名稱(總覺得不能換比較好)
      const { error } = await supabase.from('profiles').update({ name: userName, persona: userPersona, avatar_url: userAvatarUrl, phone: userPhone, address: userAddress }).eq('user_id', user.id)
      if (error) throw error
      alert(' 個人資訊更新成功！')
    } catch (error) {
      alert('更新失敗：' + error.message)
    }
  }




  const fetchUserInfo = async () => {
    if (!user) return
    // Supabase 會自動根據你的登入憑證與 RLS 規則，只撈出屬於該 user_id 的商店
    const { data, error } = await supabase
      .from('profiles')
      .select('name,persona,avatar_url,phone,address')
      .eq('user_id',user.id)
      .eq('is_active',true)
      
    // console.log("目前要測試的變數是  data：", data);
    if (!error) {

    setUserName(data[0]?.name || '')
    setUserPersona(data[0]?.persona || '')
    setUserAvatarUrl(data[0]?.avatar_url || '')
    setUserPhone(data[0]?.phone || '')
    setUserAddress(data[0]?.address || '')

    setLoading(false)
  } }

 
  return (
        // <div className="flex flex-col h-full w-full items-center justify-center p-4 bg-slate-50 overflow-hidden"></div>
    // <div className="min-h-screen bg-gray-50 pb-12">
    <div className="min-h-screen bg-gray-50 pb-2">
      {/* 行動裝置頂部列 */}

    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <h2 className="text-base font-bold text-slate-800 mb-4">編輯個人資訊</h2>
      <form onSubmit={handleUpdateUserInfo} className="space-y-3">
      <div className="flex items-center justify-between mb-4">

  {/*沒加button 預設是submit  會觸發onSubmit*/}
       
      </div>


      <div className="flex gap-4"> {/* 使用 flex 讓子元素並排，gap-4 設定欄位間距 */}
        <div className="flex-1"> {/* flex-1 讓兩個欄位平分寬度 */}
          <label className="block text-xs font-bold text-slate-700 mb-1">* 姓名</label>
          <input type="text" required value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
        <div className="flex-1"> 
          <label className="block text-xs font-bold text-slate-700 mb-1">* 郵箱(不可更改)</label>
          <input type="text" readOnly value={user.email}  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
      </div>

      <div className="flex gap-4"> {/* 使用 flex 讓子元素並排，gap-4 設定欄位間距 */}
        <div className="flex-1"> {/* flex-1 讓兩個欄位平分寬度 */}
          <label className="block text-xs font-bold text-slate-700 mb-1">暱稱</label>
          <input type="text" value={userPersona} onChange={(e) => setUserPersona(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="留言功能還沒做..." />
        </div>
        <div className="flex-1"> 
          <label className="block text-xs font-bold text-slate-700 mb-1">聯絡電話</label>
          <input type="text" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="目前非必填..." />
        </div>
      </div>

      {/* // 輸出結果：2026-11-02 */}
      {/* {user.created_at ? user.created_at.slice(0, 10) : ''} */}
      <div className="flex gap-4"> {/* 使用 flex 讓子元素並排，gap-4 設定欄位間距 */}
        <div className="flex-1"> {/* flex-1 讓兩個欄位平分寬度 */}
          <label className="block text-xs font-bold text-slate-700 mb-1">創建時間(系統資訊)</label>
          <input type="text" readOnly value={user.created_at ? new Date(user.created_at).toLocaleDateString('zh-TW', {
              year: 'numeric',  month: 'long',  day: 'numeric'  }) : '' } onChange={(e) => setUserCreateTime(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="系統資訊無法改..." />
        </div>
        <div className="flex-1"> 
          <label className="block text-xs font-bold text-slate-700 mb-1">大頭照鏈結</label>
          <input type="text" readOnly value={userAvatarUrl} onChange={(e) => setUserAvatarUrl(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="可能不會開發..." />
        </div>
      </div>

        <label className="block text-xs font-bold text-slate-700 mb-1">其他聯絡資訊　(地址等，串金流等才需要填寫)</label>
        <input type="text" value={userAddress} onChange={(e) => setUserAddress(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="政府規定的一些資訊(待研究)..." />

        <button type="submit" className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-bold text-white shadow-md">儲存設定</button>
      </form>
    </div>

    </div>
  )
}