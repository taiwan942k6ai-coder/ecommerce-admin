import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext' // 確保路徑正確

import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import OpenNewStore from './pages/OpenNewStore.jsx'
import StoreManage from './pages/StoreManage/index.jsx'
import StoreManagePhoto from './pages/StoreManagePhoto/index.jsx'
import { Navbar } from './components/Navbar'; // 💡 用花括號引入拆好的 Navbar

import ProtectedRoute from './components/ProtectedRoute' // 👈 引入剛剛寫好的守護組件


function App() {
  return (// 修改前：min-h-screen
    // <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">

    // 修改後：
  <AuthProvider> {/* overflow-x-hidden 順便鎖死橫向，防止手機畫面左右亂晃 */}
    {/* <div className="min-h-dvh bg-slate-50 text-slate-900 font-sans overflow-x-hidden"> */}
  {/* <div className="w-screen h-[100dvh] overflow-hidden flex flex-col bg-slate-50 font-sans"> */}
  <div className="w-screen h-[100dvh] flex flex-col bg-slate-50 font-sans overflow-hidden">
    <Navbar />
    {/* <div className="flex-1 min-h-dvh bg-slate-50 text-slate-900 font-sans overflow-x-hidden overflow-y-auto"> */}
    <div className="flex-1 min-h-0 bg-slate-50 text-slate-900 overflow-y-auto">
        <Routes>
        <Route path="/"                   element={<Navigate to="/login" replace />} />{/* 預設首頁直接導向登入頁 */}
        <Route path="/login"              element={<Login />} />{/* 登入頁面：不需要保護，任何人都可以看 */}
        <Route path="/reset-password"     element={<ResetPassword />}/>

        <Route path="/dashboard"          element={<ProtectedRoute>
                                                    <Dashboard />
                                                </ProtectedRoute>}/>{/* 🔒 商店總覽（需要保護） */} 

        <Route path="/open-new-store"     element={<ProtectedRoute>
                                                    <OpenNewStore />
                                                </ProtectedRoute>}/>{/* 🔒 建立新商店（需要保護） */} 

        <Route path="/store/:storeName"   element={<ProtectedRoute>
                                                  <StoreManage />
                                                </ProtectedRoute>}/>{/* 🔒 單一商店管理與商品設定（需要保護） */}
        
        <Route path="/store-photo/:storeName"   element={<ProtectedRoute>
                                                        <StoreManagePhoto />
                                                      </ProtectedRoute>}/>{/* 🔒 單一商店管理封面照（需要保護） */}




        {/* <Route path="/store/:storeName/addProductOK"  element={<Navigate to="/store/:storeName" replace />} /> */}
        
      </Routes>
    </div>
  </div>
  </AuthProvider>
  )
}

export default App