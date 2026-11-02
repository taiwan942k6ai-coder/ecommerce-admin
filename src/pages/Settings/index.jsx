import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Store, ChevronRight, LogOut, Plus } from 'lucide-react'
import BottomNav from '../../components/BottomNav'

import Delete from './Delete'
import Personal from './Personal'

export default function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('personal')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  
  useEffect(() => { console.log("目前要測試的變數是  user：", user); }, [user])


  const handleLogout = async () => {  // 登出時，Supabase SDK 會自動清空瀏覽器裡的憑證！
    await supabase.auth.signOut()
    navigate('/login') }


  return (
    <div className="flex flex-col h-fit">
      {/* 頂部不變的導覽列 */}
      {/* <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-xs">
        <div className="w-[68px]"></div> 
        <h1 className="text-base font-bold text-slate-800 truncate max-w-[200px]">{8888}</h1>
        <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-slate-600">← 返回總覽</button>
      </header> */}

      {/* 分頁 Tab 切換 */}
      <header className="sticky top-0 mx-4 mt-4 flex rounded-lg bg-slate-100 p-1">
        <button onClick={() => setActiveTab('personal')} className={`w-1/2 rounded-md py-2 text-center text-sm font-medium transition-all ${activeTab === 'personal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>
          個人資訊
        </button>
        <button onClick={() => setActiveTab('platform')} className={`w-1/2 rounded-md py-2 text-center text-sm font-medium transition-all ${activeTab === 'platform' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>
          帳戶細節(還沒做)
        </button>
        <button onClick={() => setActiveTab('delete')} className={`w-1/2 rounded-md py-2 text-center text-sm font-medium transition-all ${activeTab === 'delete' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>
          刪除 與 註銷
        </button>
      </header>

   
      <main className="px-4 mt-4">
        {activeTab === 'personal' &&  <Personal/>}
        {activeTab === 'platform' &&  <Personal/>}
        {activeTab === 'delete'   &&  <Delete/>}
      </main>

     
      {/* <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} storeName={storeName} onUploaded={fetchStoreData} productTypeArray={productTypeArray} uid={store?.spuid}/>
      <StoreTodayImage isOpen={isAddTodayImageOpen} onClose={() => setIsAddTodayImageOpen(false)} storeName={storeName} onTodayPhotoUpdated={fetchStoreData} />
      <AiPlanSuggestion isOpen={isGiveSuggestionOpen} onClose={() => setIsGiveSuggestionOpen(false)} /> */}
      
      <BottomNav />
    </div>
  )
}