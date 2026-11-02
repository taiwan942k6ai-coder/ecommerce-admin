import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../supabaseClient'

export default function StoreSettings({ storeName, initialName, initialType, initialDesc, initialPOC, initialPhone, initialOpenTime, initialLine, initialOther, initialTodayImageUpdateAt, onInfoUpdated, isTodayImageOpen, onAddClick, uid}) {
  const [thisStoreName, setThisStoreName] = useState(initialName || '')
  const [storeType, setStoreType] = useState(initialType || '')
  const [storeDesc, setStoreDesc] = useState(initialDesc || '')
  const [storePOC, setStorePOC] = useState(initialPOC || '')
  const [storePhone, setStorePhone] = useState(initialPhone || '')
  const [storeOpenTime, setStoreOpenTime] = useState(initialOpenTime || '')
  const [storeLine, setStoreLine] = useState(initialLine || '')
  const [storeOther, setStoreOther] = useState(initialOther || '') 
  // const [todayImageUpdateAt, setTodayImageUpdateAt] = useState(initialTodayImageUpdateAt)
  const todayUTCString = new Date().toISOString().split('T')[0];

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

  const handleUpdateStoreInfo = async (e) => {
    e.preventDefault()
    try {//eq('name', storeName)應該改成uid，但我還在思考要不要讓攤販換名稱(總覺得不能換比較好)
      const { error } = await supabase.from('shops').update({ name: thisStoreName, introduce: storeDesc, poc: storePOC, phone: storePhone, open_time: storeOpenTime, line: storeLine, other: storeOther }).eq('spuid', uid)
      if (error) throw error
      alert(thisStoreName+' 商店資訊更新成功！'),
      onInfoUpdated(thisStoreName)
      // navigate(`/store/${encodeURIComponent(newStoreName)}`)//我自己加的，才不會出現上面下面名子不同。目前改名子會導致商品找不到爸爸。
      // navigate(`/dashboard`)//相同網址不會重新渲染，除非監聽網址+產生時間
    } catch (error) {
      alert('更新失敗：' + error.message)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <h2 className="text-base font-bold text-slate-800 mb-4">編輯商店資訊</h2>
      <form onSubmit={handleUpdateStoreInfo} className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        {initialTodayImageUpdateAt?.slice(0, 10) === todayUTCString?(
            <span className="font-medium text-green-600">✅已更新現場照片</span>
        ):( <span className="font-medium text-rose-500">⚠️ 尚未更新今天的現場照</span>
        )}   {/*沒加button 預設是submit  會觸發onSubmit*/}
        <button type="button" onClick={onAddClick} className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-95 transition-all">+ 更新今日現場照片</button>
      </div>


      <div className="flex gap-4"> {/* 使用 flex 讓子元素並排，gap-4 設定欄位間距 */}
        <div className="flex-1"> {/* flex-1 讓兩個欄位平分寬度 */}
          <label className="block text-xs font-bold text-slate-700 mb-1">* 商店名稱</label>
          <input type="text" required value={thisStoreName} onChange={(e) => setThisStoreName(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
        <div className="flex-1"> 
          <label className="block text-xs font-bold text-slate-700 mb-1">* 主商品型態(不可更改)</label>
          <input type="text" readOnly value={storeType} onChange={(e) => setStoreType(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
      </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">商店描述</label>
          <textarea rows={2} value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none resize-none" placeholder="輸入關於你商店的簡介..." />
        </div>


      <div className="flex gap-4"> {/* 使用 flex 讓子元素並排，gap-4 設定欄位間距 */}
        <div className="flex-1"> {/* flex-1 讓兩個欄位平分寬度 */}
          <label className="block text-xs font-bold text-slate-700 mb-1">商店聯絡人</label>
          <input type="text" value={storePOC} onChange={(e) => setStorePOC(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="輸入商店聯絡人..." />
        </div>
        <div className="flex-1"> 
          <label className="block text-xs font-bold text-slate-700 mb-1">聯絡電話</label>
          <input type="text" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="輸入聯絡人的聯絡電話..." />
        </div>
      </div>

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

        <label className="block text-xs font-bold text-slate-700 mb-1">其他聯絡資訊　(實體攤販：攤號)　(線上電商：官網網址)</label>
        <input type="text" value={storeOther} onChange={(e) => setStoreOther(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="能讓客戶找到你的方式..." />

        <button type="submit" className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-bold text-white shadow-md">儲存設定</button>
      </form>
    </div>
  )
}