import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Store, ChevronRight, LogOut, Plus } from 'lucide-react'
import BottomNav from '../components/BottomNav'


//(待處理)   現場照上傳 的頁面(點照片會連絡去)     上線目前都TRUE(有資訊管理者後再修改)

export default function Dashboard() {
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
      .select('name,mk_name,today_image_url_old,today_image_update_at,is_visible')
      .eq('user_id',user.id)
      .eq('is_active',true)
      .order('created_at', { ascending: false })

    console.log("目前要測試的變數是  data：", data);
    if (!error) setStores(data)
    setLoading(false)
  }

  const handleLogout = async () => {
    // 登出時，Supabase SDK 會自動清空瀏覽器裡的憑證！
    await supabase.auth.signOut()
    navigate('/login')
  }


  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* 行動裝置頂部列 */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 flex justify-between items-center z-10">
        <h1 className="text-xl font-bold text-gray-900">我的商店總覽</h1>
        <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500 flex items-center gap-1">
          <span className="text-sm font-medium">登出系統</span><LogOut size={20} />
        </button>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">共 {stores.length} 間商店</p>
          <button onClick={() => navigate(`/open-new-store`)} className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
            <Plus size={16} className="mr-1" /> 新增商店
          </button>
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
              <div key={store.name} onClick={() => navigate(`/store/${store.name}`)}
                className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-between active:bg-gray-50 cursor-pointer transition shadow-sm">
                {/* <div className="flex items-center space-x-3"> */}
                {/* 1. 父容器：加上 w-full 與 justify-between，讓左右兩邊彈開 */}
                <div className="flex items-center justify-between w-full">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                    {  store.is_visible? (<Store size={20} />) : (
                      <span className="font-medium text-rose-300 text-[8px]">未上線</span>          
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{store.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-1">{store.mk_name || '暫無描述'}</p>
                  </div>

                          {/* 商店圖片 */}
                  <div className="w-32 h-18 flex-none rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs overflow-hidden border border-slate-100">
                    {  
                    store.today_image_update_at?.slice(0, 10) === todayUTCString? (
                    <img src={store.today_image_url_old} alt={store.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-medium text-rose-500 whitespace-pre-line">　(⚠️ 尚未更新){"\n"}攤販今天的現場照片</span>
                      // <span className="font-medium text-rose-500">{store.today_image_update_at?.slice(0, 10)} 空??</span>
                    )}
                  </div>  
                    
                    {/* {store.today_image_url_old ? (
                      <img src={store.today_image_url_old} alt={store.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>📦</span>
                    )} */}
                  
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