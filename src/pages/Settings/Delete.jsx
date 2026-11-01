import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Store, ChevronRight, LogOut, Plus ,Minus} from 'lucide-react'
import BottomNav from '../../components/BottomNav'


//(待處理)   現場照上傳 的頁面(點照片會連絡去)     上線目前都TRUE(有資訊管理者後再修改)

export default function Delete() {
  const { user } = useAuth()
  // const [whatUser,setWhatUser] = useState(null)
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const todayUTCString = new Date().toISOString().split('T')[0];
  console.log("目前要測試的變數是  todayUTCString：", todayUTCString);
  
  useEffect(() => {
    console.log("目前要測試的變數是  user：", user);
    fetchStores()
  }, [user])

  const fetchStores = async () => {
    if (!user) return
    // Supabase 會自動根據你的登入憑證與 RLS 規則，只撈出屬於該 user_id 的商店
    const { data, error } = await supabase
      .from('shops')
      .select('name,mk_name,today_image_url_old,today_image_update_at,spuid,is_visible')
      .eq('user_id',user.id)
      .eq('is_active',true)
      .order('created_at', { ascending: false })

    console.log("目前要測試的變數是  data：", data);
    if (!error) setStores(data)
    setLoading(false)
  }

  const handleDeleteAccount = async (id) => {  try {
        console.log("要刪除的用戶為：", id);
        // 【核心】呼叫我們在 SQL Editor 寫的 RPC 函數
        const { error: rpcError } = await supabase.rpc('delete_user_self');
        if (rpcError) throw rpcError;   

        // 清除前端殘留的登入 Session 狀態
        await supabase.auth.signOut()
        alert('帳號已刪除，感謝您使用 市集小幫手。\n\n祝福您的事業，如樹栽種在溪水旁，\n按時後結果子，葉子也不枯乾。')
        navigate('/login')
            } catch (error) {
            console.error('註銷失敗:', error);
            Swal.fire('註銷失敗', error.message || '伺服器發生異常，請稍後再試。', 'error');
            }
    }

    const handleDeleteStore = async (uid,name) => {
    console.log("要刪除的商店為：", name);
    if (!user) return
    // Supabase 會自動根據你的登入憑證與 RLS 規則，只撈出屬於該 user_id 的商店
    const { data, error } = await supabase
      .from('shops')
      .update({is_active:false})
      .eq('spuid', uid)
    alert('商店 '+name+' 已刪除，\n畫面將回到商店總覽')
    setLoading(false)
    navigate('/dashboard')
  }

  return (
        // <div className="flex flex-col h-full w-full items-center justify-center p-4 bg-slate-50 overflow-hidden"></div>
    // <div className="min-h-screen bg-gray-50 pb-12">
    <div className="min-h-screen bg-gray-50 pb-2">
      {/* 行動裝置頂部列 */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 flex justify-between items-center z-10">
        <h1 className="text-xl font-bold text-gray-900">　刪除商店(不可逆)</h1>
        <button className="p-2 text-gray-500 hover:text-red-500 flex items-center gap-1" onClick={() => {
                        // 1. 先跳出輸入框，讓使用者輸入密碼
                        const password = prompt('刪除帳戶不可逆，\n若仍要刪除，請正確輸入註冊電子郵箱：');
                                                    
                        // 2. 判斷使用者是否點擊「確認」（此時 password 不為 null）
                        if (password !== null) {
                        if (password.trim() === '' ) {
                            alert('電子郵箱不能為空！');    return; }
                        if (password.trim() !== user.email ) { 
                            alert('電子郵箱輸入錯誤！');    return; }

                        // 3. 密碼輸入後，才執行後續動作
                        console.log('驗證密碼：', password);
                        handleDeleteAccount(user.id)
                        }// 如果點擊「取消」，password 會是 null，直接結束，什麼都不會發生
                        }}>
          <span className="text-sm font-medium">註銷帳戶</span><LogOut size={20} />
        </button>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 pb-24">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">共 {stores.length} 間商店</p>
          <p className="text-sm text-gray-500">點擊要刪除的商店</p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">載入中...</p>
        ) : stores.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-2xl border border-gray-100">
            <Store className="mx-auto text-gray-300 mb-2" size={40} />
            <p className="text-gray-500">目前您還沒有建立任何商店</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stores.map(store => (
              <div  className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-between active:bg-gray-50 cursor-pointer transition shadow-sm"
                    key={store.name}   onClick={() => {
                        // 1. 先跳出輸入框，讓使用者輸入密碼
                        const password = prompt('刪除商店不可逆，\n若仍要刪除，請正確輸入要刪除的商店名稱：');
                                                    
                        // 2. 判斷使用者是否點擊「確認」（此時 password 不為 null）
                        if (password !== null) {
                        if (password.trim() === '' ) {
                            alert('商店名稱不能為空！');    return; }
                        if (password.trim() !== store.name ) { 
                            alert('商店名稱輸入錯誤！');    return; }

                        // 3. 密碼輸入後，才執行後續動作
                        console.log('驗證密碼：', password);
                        handleDeleteStore(store.spuid,store.name)
                        }// 如果點擊「取消」，password 會是 null，直接結束，什麼都不會發生
                        }}>

                <div className="flex items-center justify-between w-full">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                    {  store.is_visible? (<Store size={20} />) : ( <span className="font-medium text-rose-300 text-[8px]">未上線</span> )}
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{store.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-1">{store.mk_name || '所屬市集消失了'}</p>
                  </div>
                          {/* 商店圖片 */}
                  <div className="w-32 h-18 flex-none rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs overflow-hidden border border-slate-100">
                    {  store.today_image_update_at?.slice(0, 10) === todayUTCString? (
                        <img src={store.today_image_url_old} alt={store.name} className="h-full w-full object-cover" />
                        ) : (
                        <span className="font-medium text-rose-500 whitespace-pre-line">　(⚠️ 尚未更新){"\n"}攤販今天的現場照片</span> )}
                  </div>  

                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav /> 
    </div>
  )
}