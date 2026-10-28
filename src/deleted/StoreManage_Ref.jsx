import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import BottomNav from '../components/BottomNav'

export default function StoreManage() {
  const { storeId } = useParams() // 從網址取得 :storeId
  const navigate = useNavigate()
  
  // 狀態管理
  const [activeTab, setActiveTab] = useState('products') // 'products' 或 'settings'
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // 表單狀態
  const [storeName, setStoreName] = useState('')
  const [storeDesc, setStoreDesc] = useState('')

  // 1. 撈取該商店資料與商品清單
  useEffect(() => {
    async function fetchStoreData() {
      try {
        setLoading(true)
        
        // 檢查登入狀態
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          navigate('/login')
          return
        }

        // 撈商店基本資訊
        const { data: storeData, error: storeErr } = await supabase
          .from('stores')
          .select('*')
          .eq('id', storeId)
          .single()

        if (storeErr) throw storeErr
        setStore(storeData)
        setStoreName(storeData.name)
        setStoreDesc(storeData.description || '')

        // 撈該商店的商品清單
        const { data: productData, error: prodErr } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeId)
          .order('created_at', { ascending: false })

        if (prodErr) throw prodErr
        setProducts(productData || [])

      } catch (error) {
        alert('讀取商店失敗：' + error.message)
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchStoreData()
  }, [storeId, navigate])

  // 2. 更新商店資訊
  const handleUpdateStore = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('stores')
        .update({ name: storeName, description: storeDesc })
        .eq('id', storeId)

      if (error) throw error
      alert('商店資訊更新成功！')
    } catch (error) {
      alert('更新失敗：' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-slate-500 animate-pulse text-sm">資料載入中...</div>
      </div>
    )
  }

  return (
    <div className="pb-24"> {/* 留白給手機端底部導覽 */}
      {/* 頂部導覽列 */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-xs">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-sm font-medium text-slate-600 active:text-slate-900"
        >
          ← 返回總覽
        </button>
        <h1 className="text-base font-bold text-slate-800 truncate max-w-[200px]">
          {store?.name}
        </h1>
        <div className="w-12"></div> {/* 視覺平衡用 */}
      </header>

      {/* 手機版分頁切換按鈕 (Tabs) */}
      <div className="mx-4 mt-4 flex rounded-lg bg-slate-100 p-1">
        <button
          onClick={() => setActiveTab('products')}
          className={`w-1/2 rounded-md py-2 text-center text-sm font-medium transition-all ${
            activeTab === 'products' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
          }`}
        >
          商品管理 ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-1/2 rounded-md py-2 text-center text-sm font-medium transition-all ${
            activeTab === 'settings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
          }`}
        >
          商店設定
        </button>
      </div>

      {/* 內容區塊 */}
      <main className="px-4 mt-4">
        {activeTab === 'products' ? (
          /* ----- 商品管理頁面 ----- */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">商品清單</h2>
              <button 
                onClick={() => alert('後續可實作新增商品彈窗')}
                className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 active:scale-95 transition-all"
              >
                + 新增商品
              </button>
            </div>

            {products.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
                <p className="text-sm text-slate-400">目前此商店還沒有商品</p>
              </div>
            ) : (
              /* 行動裝置最佳化：商品卡片列表 */
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                    <div className="flex items-center space-x-3">
                      {/* 商品圖片預留位置 */}
                      <div className="h-12 w-12 flex-none rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                        📦
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{product.name}</h3>
                        <p className="text-xs text-brand-600 font-semibold mt-0.5">
                          \${product.price?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* 上下架狀態與編輯 */}
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {product.is_active ? '販售中' : '已下架'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ----- 商店設定頁面 ----- */
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-4">編輯商店資訊</h2>
            <form onSubmit={handleUpdateStore} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">商店名稱</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">商店描述</label>
                <textarea
                  rows="3"
                  value={storeDesc}
                  onChange={(e) => setStoreDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none resize-none"
                  placeholder="輸入關於你商店的簡介..."
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-bold text-white shadow-md active:bg-brand-700"
              >
                儲存設定
              </button>
            </form>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}