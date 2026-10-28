import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function StoreSettings({ storeName, initialName, initialType, initialDesc, initialPOC, initialPhone, initialOpenTime, initialLine, initialTodayImageUpdateAt,onInfoUpdated, isTodayImageOpen, onAddClick, uid}) {
  const [thisStoreName, setThisStoreName] = useState(initialName || '')
  const [storeType, setStoreType] = useState(initialType || '')
  const [storeDesc, setStoreDesc] = useState(initialDesc || '')
  const [storePOC, setStorePOC] = useState(initialPOC || '')
  const [storePhone, setStorePhone] = useState(initialPhone || '')
  const [storeLine, setStoreLine] = useState(initialLine || '')
  const [storeOpenTime, setStoreOpenTime] = useState(initialOpenTime || '')
  // const [todayImageUpdateAt, setTodayImageUpdateAt] = useState(initialTodayImageUpdateAt)

  const todayUTCString = new Date().toISOString().split('T')[0];
  const navigate = useNavigate()

  const handleUpdateStoreInfo = async (e) => {
    e.preventDefault()
    try {//eq('name', storeName)應該改成uid，但我還在思考要不要讓攤販換名稱(總覺得不能換比較好)
      const { error } = await supabase.from('shops').update({ name: thisStoreName, introduce: storeDesc, poc: storePOC, phone: storePhone, open_time: storeOpenTime, line: storeLine }).eq('spuid', uid)
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
        ):( <span className="font-medium text-rose-500">⚠️ 尚未更新今天的現場照片</span>
        )}   {/*沒加button 預設是submit  會觸發onSubmit*/}
        <button type="button" onClick={onAddClick} className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-95 transition-all">+ 更新今日現場照片</button>
      </div>
      <div>　</div>


      <div className="flex gap-4"> {/* 使用 flex 讓子元素並排，gap-4 設定欄位間距 */}
        <div className="flex-1"> {/* flex-1 讓兩個欄位平分寬度 */}
          <label className="block text-xs font-bold text-slate-700 mb-1">商店名稱</label>
          <input type="text" required value={thisStoreName} onChange={(e) => setThisStoreName(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
        <div className="flex-1"> 
          <label className="block text-xs font-bold text-slate-700 mb-1">商店型態(不可更改)</label>
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
          <input type="text" value={storeOpenTime} onChange={(e) => setStoreOpenTime(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="輸入商店的聯絡時間..." />
        </div>
        <div className="flex-1"> 
          <label className="block text-xs font-bold text-slate-700 mb-1">Line</label>
          <input type="text" value={storeLine} onChange={(e) => setStoreLine(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="聯絡人LineID 或 Line官方帳號..." />
        </div>
      </div>
        <button type="submit" className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-bold text-white shadow-md">儲存設定</button>
      </form>
    </div>
  )
}