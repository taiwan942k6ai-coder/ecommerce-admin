import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Store, ChevronRight, LogOut, Plus } from 'lucide-react'
import BottomNav from '../components/BottomNav'

//商店型態未完成(也還沒完整規劃)

export default function OpenNewStore() {
  const { user } = useAuth()
  const [marketArray, setMarketArray] = useState([])
  const [storeTypeArray, setStoreTypeArray] = useState([])

  const [newStoreMarket, setNewStoreMarket] = useState('')
  const [newStoreName, setNewStoreName] = useState('')
  const [newStoreType, setNewStoreType] = useState('')
  const [newStoreMKUID, setNewStoreMKUID] = useState('')

  const [storeDesc, setStoreDesc] = useState('')
  const [storePOC, setStorePOC] = useState('')
  const [storePhone, setStorePhone] = useState('')
  const [storeLine, setStoreLine] = useState('')
  const [storeOpenTime, setStoreOpenTime] = useState('')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ 
      // 1. 修正：定義非同步函式並記得在結尾加上 () 立即呼叫它
    const fetchData = async () => {
    setLoading(true)
    try {  
        const { data, error } = await supabase
        .from('markets')
        .select('name,mkuid,shop_types') 
        .order('name', { ascending: false }); // 按照 name 欄位排序

        if (error) {throw error;}

        console.log("目前要測試的變數是  data：", data);
        // setMarketArray(data.map(market => market.name)) //存純文字陣列
        setMarketArray(data) //直接存整包物件陣列(不能直接做下拉選單)
    } catch (error) {
        console.error('撈取市場資料失敗:', error.message);
    } finally{
        setLoading(false)
    }
   };
    fetchData(); // 呼叫非同步函式
  },[])

  const handleLogout =  () => { 
    navigate('/dashboard')
  }

  const handleCreateNewStore = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('shops').insert({ name: newStoreName, sp_type:newStoreType, introduce: storeDesc, poc: storePOC, phone: storePhone, open_time: storeOpenTime, line: storeLine,mkuid: newStoreMKUID, mk_name:newStoreMarket, user_id:user.id})
      if (error) throw error
      alert('新商店 '+newStoreName+' 創建成功！'),
      navigate(`/dashboard`)//相同網址不會重新渲染，除非監聽網址+產生時間
    } catch (error) {
      alert('更新失敗：' + error.message)
    }
  }

  useEffect(() => {
  console.log("市場資料已成功更新：", marketArray);
}, [marketArray]); // 當 marketArray 變動時才會觸發

    if (loading)     return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse text-sm">🛒 撈取市集小幫手的市集/商店型態資料...</div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* 行動裝置頂部列 */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 flex justify-between items-center z-10">
        <h1 className="text-xl font-bold text-gray-900">建立新商店</h1>
        <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500 flex items-center gap-1">
          <span className="text-sm font-medium">回上一頁</span><LogOut size={20} />
        </button>
      </div>


    {/* 💡 關鍵修改點：在這裡加上 px-4 讓左右內縮，mt-4 讓上下有呼吸空間，max-w-2xl mx-auto 限制大螢幕寬度 */}
    <div className="px-4 mt-4 max-w-2xl mx-auto">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <h2 className="text-base font-bold text-slate-800 mb-4">說明文件(未完成)</h2>
        <p className="block text-xs font-bold text-slate-700 mb-1 whitespace-pre-line">實體商店 商店位置目前只能選【榮星攤販集中場】{"\n"}
          線上電商 請選 【香水】 或 【精油】　　商店名稱 7個中文字內{"\n"}Line鏈結 不能寫LineID 或 @官方帳號{"\n"}　{"\n"}
        </p>
        <form onSubmit={handleCreateNewStore} className="space-y-3">

        <div className="flex items-center gap-4">
            <div className="w-1/3">{/* 左邊：文字標題 (需更改為 切換標籤)*/}
                <label className="block text-sm font-bold text-slate-700">商店的真實位置</label>
            </div>
            <div className="flex-1">{/* 右邊：下拉選單 (根據標籤 會有不同的下拉選單)*/}
            <select
                value={newStoreMarket}
                onChange={(e) => {setNewStoreMarket(e.target.value); 
                    const target = marketArray.find(m => m.name === e.target.value);
                    // console.log("目前要測試的變數是  target.mkuid：", target.mkuid);
                    if (target) { setNewStoreMKUID(target.mkuid);} 
                    if (target) { setStoreTypeArray(target.shop_types);} 
                  } }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none bg-white h-10">
            <option value="">請選擇地點...</option>
            {/* 關鍵修改：使用 .map() 將陣列展開成多個 <option> */}
            {marketArray && marketArray.map((market, index) => (
                <option key={index} value={market.name}>
                    {market.name}
                </option>         ))}
            </select>
            </div>
        </div>

        <div className="flex gap-4"> 
          <div className="flex-1"> 
            <label className="block text-xs font-bold text-slate-700 mb-1">商店名稱</label>
            <input type="text" required value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
          <div className="flex-1"> 
            <label className="block text-xs font-bold text-slate-700 mb-1">商店型態(需先確認商店位置)</label>
            {/* <input type="text" required value={newStoreType} onChange={(e) => setNewStoreType(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" /> */}
            <select
                value={newStoreType}
                onChange={(e) => setNewStoreType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
            <option value="">請選擇型態...</option>
            {/* 關鍵修改：使用 .map() 將陣列展開成多個 <option> */}
            {storeTypeArray && storeTypeArray.map((type, index) => (
                <option key={index} value={storeTypeArray[index]}>
                    {storeTypeArray[index]}
                </option>         ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">商店描述</label>
          <textarea rows="text" value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none resize-none" placeholder="輸入關於你商店的簡介..." />
        </div>

        <div className="flex gap-4"> 
          <div className="flex-1"> 
            <label className="block text-xs font-bold text-slate-700 mb-1">商店聯絡人</label>
            <input type="text" value={storePOC} onChange={(e) => setStorePOC(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="輸入商店聯絡人..." />
          </div>
          <div className="flex-1"> 
            <label className="block text-xs font-bold text-slate-700 mb-1">聯絡電話</label>
            <input type="text" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="輸入聯絡人的聯絡電話..." />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">營業時間</label>
            <input type="text" value={storeOpenTime} onChange={(e) => setStoreOpenTime(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="輸入商店的營業時間..." />
          </div>
          <div className="flex-1"> 
            <label className="block text-xs font-bold text-slate-700 mb-1">Line鏈結</label>
            <input type="text" value={storeLine} onChange={(e) => setStoreLine(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="必須填寫 http://......" />
          </div>
        </div>
          <button type="submit" className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-bold text-white shadow-md">確定創建新商店</button>
        </form>
      </div></div>
      <BottomNav /> 
    </div>
  )
}