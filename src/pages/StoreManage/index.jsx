import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

// 📥 引入拆解出來的子組件
import ProductList from './ProductList'
import StoreSettings from './StoreSettings'
import ProductModal from './ProductModal'
import StoreTodayImage from './StoreTodayImage'
import BottomNav from '../../components/BottomNav'

export default function StoreManage() {
  const { storeName } = useParams()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('products')
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTodayImageOpen, setIsTodayImageOpen] = useState(false)

  const [productTypeArray, setProductTypeArray] = useState([])

  // 封裝成可重複呼叫的資料撈取函式
  // useCallback 確保除非特定資料變了，否則 fetchStoreData 的記憶體位置會被快取，才不會導致無限循環、重複渲染。
  const fetchStoreData = useCallback(async (storeName) => {
    console.log("目前要測試的變數是  storeName：", storeName);
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return navigate('/login')

      const { data: storeData } = await supabase.from('shops').select('*').eq('name',storeName).single()
      setStore(storeData)

      const { data: productData } = await supabase.from('off_line_products').select('*').eq('spuid',storeData.spuid).eq('is_active',true).order('pdid', { ascending: false })
      setProducts(productData || [])

      const { data: productTypeData } = await supabase.from('markets').select('product_types').eq('mkuid',storeData.mkuid).single()
      setProductTypeArray(productTypeData.product_types || [])


      // console.log("目前要測試的變數是  { session }：", { session });//重新命名（Destructuring assignment with renaming）寫法，不存在變數 data
      console.log("目前要測試的變數是  productTypeData：", productTypeData);
    } catch (error) {
      alert('讀取失敗：' + error.message)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [storeName, navigate])

  useEffect(() => {
    fetchStoreData(storeName)
  }, [fetchStoreData])


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse text-sm">{storeName}資料載入中...</div>
      </div>
    )
  }

  return (
    <div className="pb-24">
      {/* 頂部不變的導覽列 */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-xs">
        <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-slate-600">← 返回總覽</button>
        <h1 className="text-base font-bold text-slate-800 truncate max-w-[200px]">{store?.name}</h1>
        <div className="w-12"></div>
      </header>

      {/* 分頁 Tab 切換 */}
      <div className="mx-4 mt-4 flex rounded-lg bg-slate-100 p-1">
        <button onClick={() => setActiveTab('settings')} className={`w-1/2 rounded-md py-2 text-center text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>
          商店資訊設定
        </button>
        <button onClick={() => setActiveTab('products')} className={`w-1/2 rounded-md py-2 text-center text-sm font-medium transition-all ${activeTab === 'products' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>
          人工管理商品 ({products.length})
        </button>
        <button onClick={() => setActiveTab('ai')} className={`w-1/2 rounded-md py-2 text-center text-sm font-medium transition-all ${activeTab === 'ai' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>
          AI分析_測試
        </button>
      </div>

      {/* 內容渲染區 */}
      <main className="px-4 mt-4">
        {activeTab === 'products' ? (
          <ProductList storeName={storeName} products={products} setProducts={setProducts} onAddClick={() => setIsModalOpen(true)} onPriceUpdated={fetchStoreData} uid={store?.spuid}/>
        ) : (
          <StoreSettings storeName={storeName} initialName={store?.name} initialDesc={store?.introduce} initialType={store?.sp_type}
              initialPOC={store?.poc} initialPhone={store?.phone} initialOpenTime={store?.open_time} initialLine={store?.line} onInfoUpdated={fetchStoreData}
              initialTodayImageUpdateAt={store?.today_image_update_at} isTodayImageOpen={isTodayImageOpen} onAddClick={() => setIsTodayImageOpen(true)} uid={store?.spuid}/>
        )}
      </main>

      {/* 獨立彈窗 */}
      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} storeName={storeName} onUploaded={fetchStoreData} productTypeArray={productTypeArray} uid={store?.spuid}/>

      <StoreTodayImage isOpen={isTodayImageOpen} onClose={() => setIsTodayImageOpen(false)} storeName={storeName} onTodayPhotoUpdated={fetchStoreData} />

      {/* 底部全域導覽 */}
      <BottomNav />
    </div>
  )
}