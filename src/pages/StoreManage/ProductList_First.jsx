import { supabase } from '../../supabaseClient'

export default function ProductList({ products, setProducts, onAddClick }) {
  
  const handleToggleActive = async (productId, currentStatus) => {
    try {
      const { error } = await supabase.from('products').update({ is_active: !currentStatus }).eq('id', productId)
      if (error) throw error
      setProducts(products.map(p => p.id === productId ? { ...p, is_active: !currentStatus } : p))
    } catch (error) {
      alert('切換狀態失敗：' + error.message)
    }
  }

  const handleDeleteProduct = async (productId, productName) => {
    if (!confirm(`確定要永久刪除「${productName}」嗎？`)) return
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId)
      if (error) throw error
      setProducts(products.filter(p => p.id !== productId))
    } catch (error) {
      alert('刪除失敗：' + error.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">商品清單</h2>
        <button onClick={onAddClick} className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-95 transition-all">+ 新增商品</button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
          <p className="text-sm text-slate-400">目前此商店還沒有商品</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 flex-none rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs overflow-hidden border border-slate-100">
                  { product.image_url_old? <img src={product.image_url_old} alt={product.name} className="h-full w-full object-cover" /> : <span>📦</span>}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{product.name}</h3>
                  <p className="text-xs text-brand-600 font-semibold mt-0.5">\${product.price_origin?.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button onClick={() => handleToggleActive(product.id, product.is_active)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${product.is_active ? 'bg-brand-600' : 'bg-slate-200'}`}>
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${product.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <button onClick={() => handleDeleteProduct(product.id, product.name)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}






//  <div key={product.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-x-2">
      
//       {/* 1. 最左側：庫存 Checkbox (如果是 false 就取消打勾) */}
//       <div className="flex flex-shrink-0 items-center pl-1">
//         <input
//           type="checkbox"
//           checked={product.have_stock} 
//           onChange={() => handleToggleActive(product.id, product.have_stock)}
//           className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
//         />
//       </div>

//       {/* 2. 中間偏左：圖片 + 商品名稱與目前價格 (維持上下顯示) */}
//       <div className="flex flex-1 items-center space-x-3 min-w-0">
//         {/* 商品圖片 */}
//         <div className="h-12 w-12 flex-none rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs overflow-hidden border border-slate-100">
//           {product.image_url_old ? (
//             <img src={product.image_url_old} alt={product.name} className="h-full w-full object-cover" />
//           ) : (
//             <span>📦</span>
//           )}
//         </div>
        
//         {/* 名稱與目前價格 */}
//         <div className="min-w-0 flex-1">
//           <h3 className="text-sm font-bold text-slate-800 truncate">{product.name}</h3>
//           <p className="text-xs text-slate-400 mt-0.5">
//             目前: <span className="text-brand-600 font-semibold">${product.price_origin?.toLocaleString()}</span>
//           </p>
//         </div>
//       </div>
      
//       {/* 3. 中間偏右：修改價格欄位 (帶左右/上下箭頭增減按鈕) */}
//       <div className="flex flex-shrink-0 items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
//         {/* 減少按鈕 ➖ */}
//         <button 
//           onClick={() => handlePriceChange(product.id, -1)} // 點一下減 10 元，可自行修改
//           className="px-2 py-1 text-slate-500 hover:bg-slate-200 rounded font-bold text-xs"
//         >
//           －
//         </button>
        
//         {/* 價格輸入框 */}
//         <input
//           type="number"
//           value={currentNewPrice}
//           onChange={(e) => handlePriceInput(product.id, e.target.value)}
//           className="w-14 bg-transparent text-center text-sm font-semibold text-slate-700 border-0 p-0 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//         />
        
//         {/* 增加按鈕 ➕ */}
//         <button 
//           onClick={() => handlePriceChange(product.id, 1)} // 點一下加 10 元，可自行修改
//           className="px-2 py-1 text-slate-500 hover:bg-slate-200 rounded font-bold text-xs"
//         >
//           ＋
//         </button>
//       </div>

//       {/* 4. 最右側：功能操作 (保留垃圾桶，原本的開關已融合到最左邊 Checkbox，或可依需求留著) */}
//       <div className="flex flex-shrink-0 items-center">
//         <button 
//           onClick={() => handleDeleteProduct(product.id, product.name)} 
//           className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all text-sm"
//         >
//           🗑️
//         </button>
//       </div>

//     </div>
  