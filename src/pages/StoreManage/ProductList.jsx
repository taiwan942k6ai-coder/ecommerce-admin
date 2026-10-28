import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'


//(待製作) 點照片，出現商品描述 和圖片更新(目前圖和新上傳圖)


export default function ProductList({ storeName, products, setProducts, onAddClick, onPriceUpdated, uid }) {
// console.log("目前要測試的變數是  products：", products);

  const handleToggleActive = async (productId, currentStatus) => {//is_active
    try {
      const { error } = await supabase.from('off_line_products').update({ have_stock: !currentStatus }).eq('pdid', productId)
      if (error) throw error
      setProducts(products.map(p => p.pdid === productId ? { ...p, have_stock: !currentStatus } : p))
    } catch (error) {
      alert('切換狀態失敗：' + error.message)
    }
  }

  const handleDeleteProduct = async (productId, productName) => {
    if (!confirm(`確定要永久刪除「${productName}」嗎？`)) return
    try {
      // const { error } = await supabase.from('off_line_products').delete().eq('pdid', productId)
      const { error } = await supabase.from('off_line_products').update({ is_active: false }).eq('pdid', productId)
      if (error) throw error
      setProducts(products.filter(p => p.pdid !== productId))
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
          initialPrices[p.name] = p.price_origin ?? 0;
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
      pdid: p.pdid,                           // 用來比對的主鍵
      price_origin: newPrices[p.name],         // 要更新的新售價
      name: p.name, // 💡 補上欄位，解決 NOT NULL 限制
      spuid: uid,
      sp_name: p.sp_name
    }));

    console.log("目前要測試的變數是  updateData：", updateData);

    // 2. 只發送一次請求，利用 upsert 進行批量更新
    const { error } = await supabase
      .from('off_line_products')
      .upsert(updateData, { onConflict: 'pdid' }); // 💡 關鍵：告訴 Supabase 如果 pdid 重複就用更新的

    if (error) throw error;

    // 3. 成功後才執行 UI 更新
    onPriceUpdated(storeName);

  } catch (error) {
    alert('更新售價失敗：' + error.message);
  }
};

  // products.map((product) => {
  // // 取得該商品當前的修改中價格，若還沒初始化則拿原本價格
  // const currentNewPrice = newPrices[product.name] ?? (product.price_origin ?? 0);})

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">商品清單</h2>
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
             <div key={product.pdid} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-x-2">
      
              {/* 1. 最左側：庫存 Checkbox (如果是 false 就取消打勾) */}
              <div className="flex flex-shrink-0 items-center pl-1">
                <input
                  type="checkbox"
                  checked={product.have_stock} 
                  onChange={() => handleToggleActive(product.pdid, product.have_stock)}
                  className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </div>

              {/* 2. 中間偏左：圖片 + 商品名稱與目前價格 (維持上下顯示) */}
              <div className="flex flex-1 items-center space-x-3 min-w-0">
                {/* 商品圖片 */}
                <div className="h-12 w-12 flex-none rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs overflow-hidden border border-slate-100">
                  {product.image_url_old ? (
                    <img src={product.image_url_old} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                
                {/* 名稱與目前價格 */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{product.name} / {product.unit}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    目前: <span className="text-brand-600 font-semibold">${product.price_origin?.toLocaleString()}</span>
                  </p>
                </div>
              </div>
              
              {/* 3. 中間偏右：修改價格欄位 (帶左右/上下箭頭增減按鈕) */}
              <div className="flex flex-shrink-0 items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                {/* 減少按鈕 ➖ */}
                <button 
                  onClick={() => handlePriceChange(product.name, -1)} // 點一下減 10 元，可自行修改
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
                  value={newPrices[product.name]?? ''}//<input> 元素在生命週期中，從「非受控（Uncontrolled）」變成了「受控（Controlled）」
                  onChange={(e) => handlePriceInput(product.name, e.target.value)}
                  className="w-14 bg-transparent text-center text-sm font-semibold text-slate-700 border-0 p-0 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                
                {/* 增加按鈕 ➕ */}
                <button 
                  onClick={() => handlePriceChange(product.name, 1)} // 點一下加 10 元，可自行修改
                  className="px-2 py-1 text-slate-500 hover:bg-slate-200 rounded font-bold text-xs"
                >
                  ＋
                </button>
              </div>

              {/* 4. 最右側：功能操作 (保留垃圾桶，原本的開關已融合到最左邊 Checkbox，或可依需求留著) */}
              <div className="flex flex-shrink-0 items-center">
                <button 
                  onClick={() => handleDeleteProduct(product.pdid, product.name)} 
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