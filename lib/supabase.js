import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'

const supabaseUrl = 'https://tnehnkqqudlbitbtnjdi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZWhua3FxdWRsYml0YnRuamRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2ODkwOTYsImV4cCI6MjA4NDI2NTA5Nn0.REOCtHnMKJPjjfVaLhi_Tng0HvK6-jyQHVeyb9hrLcI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})