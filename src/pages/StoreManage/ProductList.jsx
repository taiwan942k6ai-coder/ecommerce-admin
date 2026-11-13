import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../supabaseClient'


//(待製作) 點照片，出現商品描述 和圖片更新(目前圖和新上傳圖 都要顯示，還在思考要不要做)
export default function ProductList({ storeName, products, setProducts, onAddClick, onAddClick2, onPriceUpdated, uid, setSelectedProduct,storeUID }) {

  const handleToggleActive = async (productId, currentStatus,productName) => {//is_active
    try {
      const { error } = await supabase.from('products').update({ have_stock: !currentStatus }).eq('pduid', productId)
      if (error) throw error
      setProducts(products.map(p => p.pduid === productId ? { ...p, have_stock: !currentStatus } : p))
      console.log(productName, "更新狀態:", currentStatus?"有銷售":"沒有賣");
    } catch (error) {
      alert('切換狀態失敗：' + error.message)
    }
  }

  const handleDeleteProduct = async (productId, productName) => {
    if (!confirm(`確定要永久刪除「${productName}」嗎？`)) return
    try {
      // const { error } = await supabase.from('off_line_products').delete().eq('pdid', productId)
      const { error } = await supabase.from('products').update({ is_active: false }).eq('pduid', productId)
      if (error) throw error
      setProducts(products.filter(p => p.pduid !== productId))
      console.log("刪除商品:", productName);
    } catch (error) {
      alert('刪除失敗：' + error.message)
    }
  }

  // 儲存每件商品新輸入的價格，格式會像： { "prod_001": 150, "prod_002": 390 }
  const [newPrices, setNewPrices] = useState({});
  useEffect(() => {// 當產品列表從後端載入成功時，初始化預設價格（讓修改價格預設等於目前價格）
      if (products.length > 0) {
        const initialPrices = {};
        products.forEach(p => {
          // 預設值使用目前價格，如果沒有就預設 0
          initialPrices[p.pduid] = p.price_origin ?? 0;
        });
        setNewPrices(prev => ({ ...initialPrices, ...prev }));
      }
  }, [products]);
  const handlePriceChange = (productName, amount) => {// 處理價格加減的通用函式
    setNewPrices(prev => {
      const currentPrice = prev[productName] ?? 0;
      const nextPrice = currentPrice + amount;
      return {
        ...prev,
        [productName]: nextPrice < 0 ? 0 : nextPrice // 避免價格變負數
      };
    });
  };
  const handlePriceInput = (productName, value) => {// 處理手動輸入價格
    const num = parseInt(value, 10);
    setNewPrices(prev => ({
      ...prev,
      [productName]: isNaN(num) ? 0 : num
    }));
  };
  // const handlePriceUpdate = async(products, newPrices) => {//更新資料庫最新的售價(沒執行，就不會更新任何售價)
  //   try { // 1. 使用 map 建立一個包含所有 Supabase 請求的 Promise 陣列
  //     const updatePromises = products.map(async (p) => {
  //       const { error } = await supabase.from('off_line_products').update({ price_origin: newPrices[p.name] }).eq('pdid', p.pdid);
  //       if (error) throw error;
  //       });
  //         // 2. 使用 Promise.all 等待所有的更新操作全部成功完成
  //     await Promise.all(updatePromises);
  //         // 3. 全部成功後，才觸發 UI 更新
  //     onPriceUpdated(storeName);
  //   } catch (error) {
  //     alert('更新售價失敗：' + error.message)
  //   }
  // };

const handlePriceUpdate = async (products, newPrices) => {
  try {
    // 1. 先將 products 陣列轉換成 Supabase 接受的批量資料格式
    const updateData = products.map(p => ({
      pduid: p.pduid,                           // 用來比對的主鍵
      price_origin: newPrices[p.pduid],         // 要更新的新售價
      pd_name: p.pd_name, // 💡 補上欄位，解決 NOT NULL 限制
      unit: p.unit,       // 💡 補上欄位，解決 NOT NULL 限制
      spuid: p.spuid,     // 💡 補上欄位，解決 NOT NULL 限制
    }));
    // console.log("目前要測試的變數是  updateData：", updateData);

    // 2. 只發送一次請求，利用 upsert 進行批量更新
    const { error } = await supabase
      .from('products')
      .upsert(updateData, { onConflict: 'pduid' }); // 💡 關鍵：告訴 Supabase 如果 pdid 重複就用更新的
    if (error) throw error;
    console.log("商品售價更新成功");
    // 3. 成功後才執行 UI 更新
    onPriceUpdated(storeUID);

  } catch (error) {
    alert('更新售價失敗：' + error.message);
  }
};

  // products.map((product) => {
  // // 取得該商品當前的修改中價格，若還沒初始化則拿原本價格
  // const currentNewPrice = newPrices[product.name] ?? (product.price_origin ?? 0);})

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



  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">　商品清單</h2>
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
            <div className="absolute bottom-[160%] left-0 z-50 w-54 p-3 text-xs font-normal leading-normal text-white bg-gray-800 rounded-md shadow-lg break-words">
            點圖片、商品名 可更新商品資訊<br />更新售價 後，記得底部按存檔。    {/* 提示文字浮動視窗 */} {/* 提示框底部的小三角形箭頭 */}
            {/* <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-solid border-t-gray-800 border-x-transparent border-b-transparent"></div> */}
            {/* 修正後的小三角形箭頭：讓箭頭精準靠左對齊黃色問號 */}
            <div className="absolute top-full left-1 border-[5px] border-solid border-t-gray-800 border-x-transparent border-b-transparent"></div>
          </div>
          )}
        </span>
        <span/> <span/>   
        {/* <div className="flex-1 min-w-0 text-xs text-slate-600 break-words pt-1 md:pt-0 whitespace-pre-line">
          點圖片、商品名 可更新商品資訊{'\n'}更新售價，記得存檔 </div> */}
        <button onClick={onAddClick} className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-95 transition-all">+ 新增商品</button>
      </div>

      <div>
        <div key="商品欄位" className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-x-2">
          {/* 1. 最左側：有銷售 (對齊 Checkbox 寬度) */}
          <div className="w-[44px] flex flex-shrink-0 items-center justify-center">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">有銷售</h2>
          </div>
          {/* 2. 中間偏左：圖與商品名稱 (對齊圖片與名稱的 flex-1) */}
          <div className="flex flex-1 items-center space-x-3 min-w-0 pl-1 justify-center">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">商品目前售價</h2>
          </div>
          {/* 3. 中間偏右：新售價 (對齊修改價格輸入框的寬度) */}
          <div className="w-[114px] flex flex-shrink-0 items-center justify-center">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">新售價</h2>
          </div>
          {/* 4. 最右側：刪除 (對齊垃圾桶按鈕寬度) */}
          <div className="w-[32px] flex flex-shrink-0 items-center justify-center">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">刪除</h2>
          </div>
        </div>
      </div>


      {products.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
          <p className="text-sm text-slate-400">目前此商店還沒有商品</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
             <div key={product.pduid} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-x-2">
      
              {/* 1. 最左側：庫存 Checkbox (如果是 false 就取消打勾) */}
              <div className="flex flex-shrink-0 items-center pl-1">
                <input
                  type="checkbox"
                  checked={product.have_stock} 
                  onChange={() => handleToggleActive(product.pduid, product.have_stock,product.pd_name)}
                  className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </div>

              {/* 2. 中間偏左：圖片 + 商品名稱與目前價格 (維持上下顯示) */}
              <div className="flex flex-1 items-center space-x-3 min-w-0">
                <div onClick={() => { setSelectedProduct(product); onAddClick2();}} className="h-12 w-12 flex-none rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs overflow-hidden border border-slate-100 cursor-pointer">
                {/* <div className="h-12 w-12 flex-none rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs overflow-hidden border border-slate-100"> */}
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.pd_name} className="h-full w-full object-cover" />
                  ) : (  <span>📦</span> )}
                </div>
                
                {/* 名稱與目前價格 */}
                <div className="min-w-0 flex-1">
                  <h3 onClick={() => { setSelectedProduct(product); onAddClick2();}} className="text-sm font-bold text-slate-800 truncate cursor-pointer">{product.pd_name} / {product.unit}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    目前: <span className="text-brand-600 font-semibold">${product.price_origin?.toLocaleString()}</span>
                  </p>
                </div>
              </div>
              
              {/* 3. 中間偏右：修改價格欄位 (帶左右/上下箭頭增減按鈕) */}
              <div className="flex flex-shrink-0 items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                {/* 減少按鈕 ➖ */}
                <button 
                  onClick={() => handlePriceChange(product.pduid, -1)} // 點一下減 10 元，可自行修改
                  className="px-2 py-1 text-slate-500 hover:bg-slate-200 rounded font-bold text-xs"
                >
                  －
                </button>
                
                {/* 價格輸入框 */}
                <input
                  type="number"
                    // 當 price_new 為空值時，會自動 fallback 使用 price_origin
                  // value={product.price_new || product.price_origin || ""} 
                  // value={(product.price_new ?? product.price_origin) ?? ""}
                  value={newPrices[product.pduid]?? ''}//<input> 元素在生命週期中，從「非受控（Uncontrolled）」變成了「受控（Controlled）」
                  onChange={(e) => handlePriceInput(product.pduid, e.target.value)}
                  className="w-14 bg-transparent text-center text-sm font-semibold text-slate-700 border-0 p-0 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                
                {/* 增加按鈕 ➕ */}
                <button 
                  onClick={() => handlePriceChange(product.pduid, 1)} // 點一下加 10 元，可自行修改
                  className="px-2 py-1 text-slate-500 hover:bg-slate-200 rounded font-bold text-xs"
                >
                  ＋
                </button>
              </div>

              {/* 4. 最右側：功能操作 (保留垃圾桶，原本的開關已融合到最左邊 Checkbox，或可依需求留著) */}
              <div className="flex flex-shrink-0 items-center">
                <button 
                  onClick={() => handleDeleteProduct(product.pduid, product.pd_name)} 
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all text-sm"
                >
                  🗑️
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="w-[44px] flex flex-shrink-0 items-center justify-center"></div>
        <div className="flex flex-1 items-center space-x-3 min-w-0 pl-1 justify-center"></div>
        <div className="w-[114px] flex flex-shrink-0 items-center justify-center">
          <button onClick={()=>handlePriceUpdate(products, newPrices)} className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-95 transition-all"> 儲存售價更新 </button>
        </div>
        <div className="w-[52px] flex flex-shrink-0 items-center justify-center"></div>
      </div>
    </div>
  )
}