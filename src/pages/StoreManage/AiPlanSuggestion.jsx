import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { Type } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, storeName, onUploaded, productTypeArray, uid }) {
  const { user } = useAuth()
  const [newSuggestionTitle, setNewSuggestionTitle] = useState('')
  const [newSuggestionDetail, setNewSuggestionDetail] = useState('')
  const [newSuggestionUser, setNewSuggestionUser] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)


  const [loading, setLoading] = useState(false);

  if (!isOpen) return null

  const handleCreateSuggestion = async (e) => {
    console.log("目前要測試的變數是  user：", user.id);
    e.preventDefault()
    if (!user) return
    if (!newSuggestionTitle) return

    try {
      setIsSubmitting(true)
  
      const { error } = await supabase
        .from('plans')
        .insert([{ title:newSuggestionTitle, detail: newSuggestionDetail, user_id: user.id}])
      if (error) throw error

      alert('已堤供新反饋：'+ newSuggestionTitle)
      // 💡 修正 1：在要開始清空與關閉彈窗之前，再次明確攔截任何潛在的預設行為
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      // 💡 修正 2：先把資料傳給爸爸，讓父組件知道要刷新了
      setNewSuggestionTitle('')
      setNewSuggestionDetail('')
      setNewSuggestionUser('')
      onClose()
    } catch (error) {
      alert('堤供反饋失敗：' + error.message)
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
          <h3 className="text-base font-bold text-slate-800">✨ 您的回饋，是小幫手進步的源頭</h3>
          <button onClick={onClose} className="text-slate-400 text-lg p-1">✕</button>
        </div>

        <form onSubmit={handleCreateSuggestion} className="space-y-4">
        

        <div className="flex gap-4"> {/* 使用 flex 讓子元素並排，gap-4 設定欄位間距 */}
          <div className="flex-1"> {/* flex-1 讓兩個欄位平分寬度 */}
            <label className="block text-xs font-bold text-slate-700 mb-1">標題 *</label>
            <input type="text" required value={newSuggestionTitle} onChange={(e) => setNewSuggestionTitle(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="不要超過八個字......"/>
          </div>
        </div>

        <div className="flex gap-4"> {/* 使用 flex 讓子元素並排，gap-4 設定欄位間距 */}
          <div className="flex-1"> {/* flex-1 讓兩個欄位平分寬度 */}
            <label className="block text-xs font-bold text-slate-700 mb-1">反饋內容 *</label>
             <textarea rows={4} value={newSuggestionDetail} onChange={(e) => setNewSuggestionDetail(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none resize-none" placeholder="請您輸入詳細的反饋內容......" />          
          </div>
        </div>


          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="w-1/2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600">取消</button>
            <button type="submit" disabled={isSubmitting} className="w-1/2 rounded-lg bg-brand-600 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-50">{isSubmitting ? '儲存中...' : '提交反饋'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}