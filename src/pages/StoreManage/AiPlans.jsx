import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

//(待製作) 點照片，出現商品描述 和圖片更新(目前圖和新上傳圖)
export default function PlainList({  onAddClick
  // , onPriceUpdated, uid   ,storeName, products, setProducts
}) 

{
  const [loading, setLoading] = useState(true)
  const [planList, setPlanList] = useState([])

    useEffect(() => {
    // console.log("目前要測試的變數是  user：", user);
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try{  setLoading(true)
      
          const { data, error } = await supabase
            .from('plans')
            .select('*')
            .eq('is_active',true)
            .order('priority', { ascending: true })

    console.log("目前要測試的變數是  data：", data);
    if (!error) setPlanList(data)
    setLoading(false)
  } catch (error){      
      alert('讀取失敗：' + error.message)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }



  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse text-sm"> 代辦清單 資料載入中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">代辦清單</h2>
        <button onClick={onAddClick} className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-95 transition-all">+ 提供反饋</button>
      </div>

      {/* <div>
        <div key="商品欄位" className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-x-2">
        
          <div className="w-[44px] flex flex-shrink-0 items-center justify-center">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">優先度</h2>
          </div>
         
          <div className="flex flex-1 items-center space-x-3 min-w-0 pl-1 justify-center">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">項目：說明</h2>
          </div>

        
          <div className="w-[32px] flex flex-shrink-0 items-center justify-center">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">複雜度</h2>
          </div>
        </div>
      </div>


      {planList.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
          <p className="text-sm text-slate-400">沒有代辦項目了!　(怎麼可能???)</p>
        </div>
      ) : (
        <div className="space-y-3">
          {planList.map((plan) => (
             <div key={plan.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-x-2">
      
               <div className="flex flex-1 items-center space-x-3 min-w-0">
                  <h1 className="text-sm font-bold text-slate-800 truncate">{plan.priority}</h1>
              </div>

               <div className="flex flex-1 items-center space-x-3 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{plan.title}</h3>
              </div>

               <div className="flex flex-1 items-center space-x-3 min-w-0">
                  <p className="text-xs text-slate-400 mt-0.5">
                    <span className="text-brand-600 font-semibold">{plan.detail}</span></p>
              </div>

               <div className="flex flex-1 items-center space-x-3 min-w-0">
                  <h1 className="text-sm font-bold text-slate-800 truncate">{plan.complexity}</h1>
              </div>

        
            </div>
          ))}

        </div>
      )} */}



{/* 表頭區塊：手機隱藏 (hidden)，桌面顯示 (md:flex) */}
<div>
  <div key="商品欄位" className="hidden md:flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-xs space-x-4">
    <div className="w-16 flex-shrink-0 text-center">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">優先度</h2>
    </div>
    <div className="w-40 flex-shrink-0">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">項目</h2>
    </div>
    <div className="flex-1 min-w-0">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">說明</h2>
    </div>
    <div className="w-16 flex-shrink-0 text-center">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">複雜度</h2>
    </div>
  </div>
</div>


{/* 只調整 flex 機制，手機與電腦共享同一套橫向佈局 */}
{/* <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3 shadow-xs space-x-2">
  <div className="w-[15%] flex-shrink-0 text-center text-xs sm:text-sm font-bold text-slate-800">
    {plan.priority}
  </div>
  <div className="w-[25%] flex-shrink-0 text-xs sm:text-sm font-semibold text-slate-800 truncate">
    {plan.title}
  </div>
  <div className="w-[45%] text-xs sm:text-sm text-slate-600 break-words line-clamp-2 md:line-clamp-none">
    {plan.detail}
  </div>
  <div className="w-[15%] flex-shrink-0 text-center text-xs sm:text-sm font-bold text-slate-800">
    {plan.complexity}
  </div>
</div> */}





{planList.length === 0 ? (
  <div className="rounded-xl border-2 border-dashed border-slate-200 py-12 text-center mt-3">
    <p className="text-sm text-slate-400">沒有代辦項目了! (怎麼可能???)</p>
  </div>  ) : (

  <div className="space-y-3 mt-3">
    {planList.map((plan) => (
      <div // key={plan.id} className="block md:flex md:items-center md:justify-between rounded-xl border border-slate-200 bg-white p-4 md:p-3 shadow-xs md:space-x-4 hover:bg-slate-50 transition-colors">
          key={plan.id} className={`block md:flex md:items-center md:justify-between rounded-xl border p-4 md:p-3 shadow-xs md:space-x-4 transition-colors
          ${Number(plan.priority) === 999   ? 'border-slate-200 bg-slate-50/50 opacity-60' /* 已完成：整條卡片變淡、背景變微灰 *//* 未完成：正常白色，有 hover 效果 */
            : 'border-slate-200 bg-white hover:bg-slate-50' }`}>
        {/* 手機版：頂部資訊列 (包含項目名稱與右上角的標籤群) */}
        <div className="flex items-start justify-between md:block md:w-40 md:flex-shrink-0 min-w-0 pb-2 md:pb-0">
          {/* 項目名稱 (10字內) */}
          <div className="text-base md:text-sm font-bold text-slate-800 truncate pr-2">
            {plan.title}
          </div>
          
          {/* 手機版才會出現的標籤群（桌機會隱藏） */}
          <div className="flex items-center space-x-1.5 md:hidden flex-shrink-0">
            { Number(plan.priority) === 1 && 
            <span className="inline-flex items-center text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
              處理中 </span>}
            {/* { Number(plan.priority) !== 999 && 
            <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              優先 {plan.priority || '待審'}   </span>} */}
              
            { Number(plan.priority) === 999 ? (
              <span className="inline-flex items-center text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 line-through">
              已完成  </span> ) : (
              <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              優先度 {plan.priority || '待審'}  </span>)
            }

            <span className="inline-flex items-center text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
              難度 {plan.complexity|| '待審'}  </span>
          </div>
        </div>


        {/* 桌面版優先度：僅在 md 以上顯示 */}
        <div className="hidden md:block w-16 flex-shrink-0 text-center order-first">
          <span className="inline-flex items-center justify-center w-7 h-7 text-xs font-bold text-slate-700 bg-slate-100 rounded-full">
            {Number(plan.priority) === 999 ? '完成' : plan.priority || '待審'} </span>
        </div>

        {/* 說明欄位：手機上會換行頂格，桌面上成為第三欄 */}
        <div className="flex-1 min-w-0 text-sm text-slate-600 break-words pt-1 md:pt-0 whitespace-pre-line">
          {plan.detail}
        </div>

        {/* 桌面版複雜度：僅在 md 以上顯示 */}
        <div className="hidden md:block w-16 flex-shrink-0 text-center">
          <span className="inline-flex items-center justify-center w-7 h-7 text-xs font-bold text-slate-700 bg-slate-100 rounded-full">
            {plan.complexity || '待審'}
          </span>
        </div>

      </div>
    ))}
  </div>
)}








      <div className="flex items-center justify-between mb-4">
        <div className="w-[44px] flex flex-shrink-0 items-center justify-center"></div>
        <div className="flex flex-1 items-center space-x-3 min-w-0 pl-1 justify-center"></div>

        <div className="w-[52px] flex flex-shrink-0 items-center justify-center"></div>
      </div>
    </div>
  )
}