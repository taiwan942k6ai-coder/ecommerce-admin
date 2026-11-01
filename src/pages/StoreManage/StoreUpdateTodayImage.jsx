import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import imageCompression from 'browser-image-compression';
import { pinyin } from 'pinyin-pro';

export default function StoreTodayImage({ isOpen, onClose, storeName, onTodayPhotoUpdated }) {
  const [imageFile, setImageFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [compressedFile, setCompressedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null

  const handleCreateProduct = async (e) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      let uploadedImageUrl = null

      if (imageFile) {
        // console.log(`原始檔案大小: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`);
      const options = {
      maxSizeMB: 1,          // 最大檔案大小（自動調整 quality 直到小於 1MB）
      maxWidthOrHeight: 1200, // 最大寬度或高度（3072*4096 會等比例縮小到 900*1200）
      useWebWorker: true,     // 使用 Web Worker 提升效能，避免畫面凍結
      fileType: 'image/jpeg'  // 強制轉成 jpeg 可以大幅縮減大小
      };
            
      setLoading(true);
      // 執行壓縮
      const compressed = await imageCompression(imageFile, options);
      console.log(`壓縮後檔案大小: ${(compressed.size / 1024 / 1024).toFixed(1)} MB`);
      setCompressedFile(compressed);//這個被拿掉了


      const fileExt = imageFile.name.split('.').pop()
      const fileNameTime = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      const safeStoreName = pinyin(storeName, { toneType: 'none' }).replace(/\s+/g, '-')
      const filePath = `${safeStoreName}_${fileNameTime}_${fileExt}`

      // console.log("目前要測試的變數是  filePath", filePath,);


      const { error: uploadError } = await supabase.storage
          .from('shop-images')
          .upload(filePath, compressed)//

        if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
          .from('shop-images')
          .getPublicUrl(filePath)
          
      uploadedImageUrl = publicUrl
      }


      const { error } = await supabase
        .from('shops')
        // .insert([{ spid:3, sp_name: storeName, name: newProdName, unit:newProdUnit, pd_type:newProdType, introduce:'', have_stock:true, price_origin: parseFloat(newProdPrice), is_active: true, image_url_old: uploadedImageUrl}])
        .update({  today_image_url_old: uploadedImageUrl })
        .eq('name', storeName)
      if (error) throw error

      alert('今日現場照片 更新成功！')
      // 💡 修正 1：在要開始清空與關閉彈窗之前，再次明確攔截任何潛在的預設行為
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }

      onTodayPhotoUpdated(storeName) // 觸發父組件重新整理
      setImageFile(null)
      onClose()
    } catch (error) {
      alert('上架失敗：' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center p-0 sm:p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* <div className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-xl transition-all transform"> */}
      {/* 1. 限制 Modal 最大高度，並在手機版底部加上 pb-20 或 pb-safe，避免被導覽列遮擋 */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-6 pb-20 sm:pb-6 shadow-xl transition-all transform"> 
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-base font-bold text-slate-800">✨ 今日現場照片</h3>
          <button onClick={onClose} className="text-slate-400 text-lg p-1">✕</button>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <p className="text-base font-bold text-slate-800">文件說明(未完成)</p>
        </div>


        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">上傳圖片(未完成，未來也不會馬上顯示)</label>
            <div className="relative flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="text-center">
                <span className="text-lg">📸</span>
                <p className="text-xs text-slate-500 mt-1">{imageFile ? `已選擇: ${imageFile.name.substring(0, 15)}...` : '選取或拍攝照片(未完成)'}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="w-1/2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600">取消</button>
            <button type="submit" disabled={isSubmitting} className="w-1/2 rounded-lg bg-brand-600 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-50">{isSubmitting ? '儲存中...' : '確認上傳'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}