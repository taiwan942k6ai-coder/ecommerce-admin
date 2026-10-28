import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 這行程式碼會自動幫你初始化，並自動在瀏覽器處理憑證(Token)的存取
export const supabase = createClient(supabaseUrl, supabaseAnonKey)