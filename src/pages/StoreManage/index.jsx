import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

// 📥 引入拆解出來的子組件
import ProductList from './ProductList'
import StoreSettings from './StoreSettings'
import AiPlans from './AiPlans'
import ProductModal from './ProductModal'
import ProductUpdateInfo from './ProductUpdateInfo'
import StoreTodayImage from './StoreUpdateTodayImage'
import AiPlanSuggestion from './AiPlanSuggestion'
import BottomNav from '../../components/BottomNav'

export default function StoreManage() {
  const { storeName } = useParams()
  const storeUID  = useLocation().state?.storeUID;
  // console.log("目前要測試的變數是  storeUID：", storeUID);
  // const [storeName, setStoreName] = useState('')
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('products')
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUpdateProdInfoOpen, setIsUpdateProdInfoOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [selectedProductName, setSelectedProductName] = useState(null)
  const [isAddTodayImageOpen, setIsAddTodayImageOpen] = useState(false)
  const [isGiveSuggestionOpen, setIsGiveSuggestionOpen] = useState(false)

  const [productTypeArray, setProductTypeArray] = useState([])

  // 封裝成可重複呼叫的資料撈取函式
  // useCallback 確保除非特定資料變了，否則 fetchStoreData 的記憶體位置會被快取，才不會導致無限循環、重複渲染。
  const fetchStoreData = useCallback(async (storeUID) => {
    
    // console.log("目前要測試的變數是  storeName：", storeName);
    try { setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return navigate('/login')

      // const { data: storeData } = await supabase.from('shops').select('*').eq('name',storeName).single()
      const { data: storeData } = await supabase.from('sellers').select('*,product_categories(category_name)').eq('spuid',storeUID).eq('is_active',true).single()
      setStore(storeData)
console.log("目前要測試的變數是  storeData", storeData);

      // const { data: productData } = await supabase.from('off_line_products').select('*').eq('spuid',storeData.spuid).eq('is_active',true).order('pdid', { ascending: false })
      const { data: productData } = await supabase.from('products').select('pd_name, pd_introduce, pduid, price_origin, unit,subcategory_id,have_stock, image_url,spuid')
      .eq('spuid',storeData.spuid).eq('is_active',true).order('created_at', { ascending: true })
      setProducts(productData || [])
console.log("目前要測試的變數是  products為什麼會延遲", products);

/*      // const { data: productTypeData } = await supabase.from('markets').select('product_types').eq('mkuid',storeData.mkuid).single()
      const { data: productTypeData } = await supabase.from('market_category_relations').select('product_categories(category_name),category_id')
      .eq('market_uid',storeData.mkuid)
      // .single()
console.log("目前要測試的變數是  productTypeData", productTypeData);
      setProductTypeArray(productTypeData || [])
      // setProductTypeArray(productTypeData.product_types || [])    寫錯了 寫成主商品型態 */

      const { data: productTypeData } = await supabase.from('product_subcategories').select('subcategory_name,subcategory_id')
      .eq('category_id',storeData.shop_type)
console.log("目前要測試的變數是  storeData.shoptype", storeData.shop_type);
      setProductTypeArray(productTypeData || [])

      // console.log("目前要測試的變數是  { session }：", { session });//重新命名（Destructuring assignment with renaming）寫法，不存在變數 data
      console.log("目前要測試的變數是  productTypeData：", productTypeData);
    } catch (error) {
      // alert('讀取失敗：' + error.message)
      alert('APP管理頁面無法使用鏈結分享')
      navigate('/dashboard')
    } finally {  setLoading(false) }
  }, [storeUID, navigate])

  useEffect(() => { fetchStoreData(storeUID)
  }, [fetchStoreData])

  if (!useLocation().state){ return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse text-sm">　　　非法鏈結<br/><br/>
        請用官方APP，登錄 {storeName} 管理頁...</div>
        {/* <div className="text-slate-500 animate-pulse text-sm">請使用官方APP頁面，登錄{storeName}管理頁...</div> */}
      </div>
    )   }
  if (loading) {    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse text-sm">{storeName}資料載入中...</div>
      </div>
    )  }

  return (
    <div className="pb-20">
      {/* 頂部不變的導覽列 */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-xs">
        <div className="w-[68px]"></div> 
        <h1 className="text-base font-bold text-slate-800 truncate max-w-[200px]">{store?.sp_name}</h1>
        <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-slate-600">← 返回總覽</button>
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
          未完成項目
          {/* AI分析_測試 */}
        </button>
      </div>

      {/* 內容渲染區 */}
      <main className="px-4 mt-4">
        {activeTab === 'products' &&  <ProductList storeUID={storeUID} storeName={storeName} products={products} setProducts={setProducts} onAddClick={() => setIsModalOpen(true)} onPriceUpdated={fetchStoreData} uid={store?.spuid} 
                                                 setSelectedProduct={setSelectedProduct} onAddClick2={() => setIsUpdateProdInfoOpen(true)}/>}
        {activeTab === 'settings' &&
          <StoreSettings storeUID={storeUID} storeName={storeName} initialName={store?.sp_name} initialDesc={store?.sp_introduce} initialType={store?.product_categories}
              initialPOC={store?.poc} initialPhone={store?.phone} initialOpenTime={store?.open_time} initialLine={store?.line} initialOther={store?.other} onInfoUpdated={fetchStoreData}
              initialTodayImageUpdateAt={store?.today_image_update_at} isAddTodayImageOpen={isAddTodayImageOpen} onAddClick={() => setIsAddTodayImageOpen(true)} uid={store?.spuid}/>}

        {activeTab === 'ai' &&  <AiPlans onAddClick={() => setIsGiveSuggestionOpen(true)}/>}
        {/* {activeTab === 'ai' &&  <AiPlans onAddClick={() => setXXXOpen(true)}/>} 未來要換成這個 */}
      </main>

      {/* 獨立彈窗 */}
      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} storeUID={storeUID} storeName={storeName} onUploaded={fetchStoreData} productTypeArray={productTypeArray} uid={store?.spuid}/>
      <ProductUpdateInfo key={selectedProduct ? selectedProduct.pdid : 'empty'}  isOpen={isUpdateProdInfoOpen} onClose={() => {setIsUpdateProdInfoOpen(false); setSelectedProduct(null)}} storeUID={storeUID} storeName={storeName} onUpdated={fetchStoreData} productTypeArray={productTypeArray} selectedProduct={selectedProduct}/>
      <StoreTodayImage isOpen={isAddTodayImageOpen} onClose={() => setIsAddTodayImageOpen(false)} storeUID={storeUID} storeName={storeName} onTodayPhotoUpdated={fetchStoreData} />
      <AiPlanSuggestion isOpen={isGiveSuggestionOpen} onClose={() => setIsGiveSuggestionOpen(false)} />
      {/* 底部全域導覽 */}
      <BottomNav />
    </div>
  )
}