import { useState, useEffect, useRef} from 'react'
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
  
  const [newStoreMarketType, setNewStoreMarketType] = useState('offline')
  const [newStoreMarketType2, setNewStoreMarketType2] = useState('')
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

    // ❓黃色問號程式碼
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = useRef(null);
    // 📱 行動端優化：點擊頁面其他地方時，自動關閉提示框
    useEffect(() => { function handleClickOutside(event) {
        if (tooltipRef.current && !tooltipRef.current.contains(event.target)) { setShowTooltip(false);} }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside); }, []);
    // 📱 行動端點擊切換
    const handleIconClick = (e) => {
      e.preventDefault();  // 防止瀏覽器把點擊問號當作表單提交
      e.stopPropagation(); // 防止事件冒泡觸發其他的點擊事件
      setShowTooltip(!showTooltip); };


  useEffect(()=>{ 
      // 1. 修正：定義非同步函式並記得在結尾加上 () 立即呼叫它
    const fetchData = async () => {
    setLoading(true)
    try {  
        const { data, error } = await supabase
        .from('markets')
        .select('name,mkuid, mk_type, mk_type2, shop_types') 
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
  console.log("市場資料已成功更新：", marketArray);}, [marketArray]); // 當 marketArray 變動時才會觸發

  const uniqueMK_type2 = marketArray ? 
  [...new Set(marketArray.filter(m => m.mk_type === newStoreMarketType).map(m => m.mk_type2))] : [marketArray];

    if (loading)     return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse text-sm">🛒 撈取市集小幫手的市集/商店型態資料...</div>
      </div>
    )

  return (    // <div className="min-h-screen bg-gray-50 pb-12"></div>
    <div className="min-h-screen bg-gray-50">
      {/* 行動裝置頂部列 */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 flex justify-between items-center z-10">
        <h1 className="text-xl font-bold text-gray-900">建立新商店</h1>
        
        <div className="flex items-center gap-4">          
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-full max-w-[180px] min-w-[140px] flex-shrink-0">
              <button  type="button"  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-md transition-all ${
                  newStoreMarketType === 'offline'? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                onClick={() => {setNewStoreMarketType('offline');setNewStoreMarketType2('');setNewStoreMarket('');setNewStoreType('');setNewStoreMKUID('');setStoreTypeArray([]);}}>實體攤販
              </button>
              <button  type="button"  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-md transition-all ${
                  newStoreMarketType === 'online'? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                onClick={() => {setNewStoreMarketType('online');setNewStoreMarketType2('');setNewStoreMarket('');setNewStoreType('');setNewStoreMKUID('');setStoreTypeArray([]);}}>線上電商
              </button>
            </div>
        </div>
        
        <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500 flex items-center gap-1">
          <span className="text-sm font-medium">回上一頁</span><LogOut size={20} />
        </button>
      </div>

    {/* 💡 關鍵修改點：在這裡加上 px-4 讓左右內縮，mt-4 讓上下有呼吸空間，max-w-2xl mx-auto 限制大螢幕寬度 */}
    <div className="px-4 mt-4 pb-24 max-w-2xl mx-auto">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        {/* <h2 className="text-base font-bold text-slate-800 mb-4">說明文件(未完成)</h2> */}
        <h2 className="block text-base font-bold text-slate-700 mb-1 whitespace-pre-line">實體攤販　目前只能選【榮星攤販集中場】{"\n"}
          線上電商　請選 【2C 美妝、香水】 {"\n"}　{"\n"}
        </h2>
        <form onSubmit={handleCreateNewStore} className="space-y-3">

        <div className="flex items-center gap-4">
          <div className="flex-1"> {/* 左邊：下拉選單 (根據標籤 會有不同的下拉選單)*/}
          <label className="block text-xs font-bold text-slate-700 mb-1">{ (newStoreMarketType === 'offline') ? '* 市集位置' : '* 產業類別' }</label>
          <select required  value={newStoreMarketType2}
              onChange={(e) => {setNewStoreMarketType2(e.target.value); setNewStoreMarket(''); setNewStoreType(''); setNewStoreMKUID(''); setStoreTypeArray([]);} }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none bg-white">
              {/* <option value="">{ (newStoreMarketType === 'offline') ? '請選擇地點...' : '請選擇類別...' }</option>
              {marketArray && marketArray.filter(market => market.mk_type === newStoreMarketType).map((market, index) => (
              <option key={index} value={market.mk_type2}>  {market.mk_type2} </option>         ))} */}
              <option value="">請選擇...</option>
              {uniqueMK_type2.map((type2, index) => (<option key={index} value={type2}>  {type2}  </option> ))  }
          </select>
          </div>

          <div className="flex-1"> 
            <label className="block text-xs font-bold text-slate-700 mb-1">{ (newStoreMarketType === 'offline') ? '* 市集名稱' : '* 電商分類' }</label>
            {/* <input type="text" required value={newStoreType} onChange={(e) => setNewStoreType(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" /> */}
            <select required  value={newStoreMarket}
                onChange={(e) => {setNewStoreMarket(e.target.value);setNewStoreType('');
                    const target = marketArray.find(m => m.name === e.target.value);
                    // console.log("目前要測試的變數是  target.mkuid：", target.mkuid);
                    if (target) { setNewStoreMKUID(target.mkuid);} 
                    if (target) { setStoreTypeArray(target.shop_types);} 
                  } }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
              <option value="">請選擇...</option>{/* 關鍵修改：使用 .map() 將陣列展開成多個 <option> */}
              {marketArray && marketArray.filter(market => market.mk_type2 === newStoreMarketType2).map((market, index) => ( 
              <option key={index} value={market.name}> {market.name} </option> ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4"> 
          <div className="flex-1"> 
            <label className="block text-xs font-bold text-slate-700 mb-1">* 商店名稱</label>
            <input type="text" required value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="不要超過七個字..."/>
          </div>
          <div className="flex-1"> 
            <label className="block text-xs font-bold text-slate-700 mb-1">{ (newStoreMarketType === 'offline') ? '* 主商品型態' : '* 主商品型態' }</label>
            {/* <input type="text" required value={newStoreType} onChange={(e) => setNewStoreType(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" /> */}
            <select required value={newStoreType}
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

        {/* <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">營業時間</label>
            <input type="text" value={storeOpenTime} onChange={(e) => setStoreOpenTime(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="線上電商不用填..." />
          </div>
          <div className="flex-1"> 
            <label className="block text-xs font-bold text-slate-700 mb-1">LineID 或 Line@ 鏈結</label>
            <input type="text" value={storeLine} onChange={(e) => setStoreLine(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="填寫格式 https://......" />
          </div>
        </div> */}

        <div className="flex gap-4"> {/* 使用 flex 讓子元素並排，gap-4 設定欄位間距 */}
        <div className="flex-1"> {/* flex-1 讓兩個欄位平分寬度 */}
          <label className="block text-xs font-bold text-slate-700 mb-1">營業時間</label>
          <input type="text" value={storeOpenTime} onChange={(e) => setStoreOpenTime(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="線上電商不用填..." />
        </div>
        <div className="flex-1"> 
          <div className="flex items-start">{/* 標題與問號容器 */}
          <label className="block text-xs font-bold text-slate-700 mb-1">LineID 或 Line@ 鏈結</label>
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
            <div className="absolute bottom-[160%] right-0 z-50 w-64 p-3 text-xs font-normal leading-normal text-white bg-gray-800 rounded-md shadow-lg break-words">
            個人 LINE 帳號（手機操作）<br />
            1.主頁點擊右上角的 「加入好友」圖示 <br />
            2.依序點擊「行動條碼」<br />
            「顯示我的條碼」「分享」「複製連結」 <br />
            3.取得 https://line.me 專屬加好友連結<br /><br />
            官方帳號 LINE@（手機操作）<br />
            1.官方帳號主頁點擊 「增加好友」<br />
            2.工具選單中，點擊 「網址」「複製網址」
            3.取得 https://lin.ee 的官方帳號專屬連結<br />
            {/* 提示文字浮動視窗 */} {/* 提示框底部的小三角形箭頭 */}
            {/* <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-solid border-t-gray-800 border-x-transparent border-b-transparent"></div> */}
            {/* 修正後的小三角形箭頭：讓箭頭精準靠左對齊黃色問號 */}
            <div className="absolute top-full right-1 border-[5px] border-solid border-t-gray-800 border-x-transparent border-b-transparent"></div>
          </div>
          )}
        </span>
      </div>
      <input type="text" value={storeLine} onChange={(e) => setStoreLine(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="填寫格式 https://......" />
      </div>
      </div>
        
          <button type="submit" className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-bold text-white shadow-md">確定創建新商店</button>
        </form>
      </div></div>
      <BottomNav /> 
    </div>
  )
}