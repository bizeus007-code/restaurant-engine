import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('data')
      .eq('id', 'main_menu')
      .single();

    if (error || !data) {
      console.error('Supabase fetch error:', error);
      return null;
    }
    return data.data;
  } catch (err) {
    console.error('Supabase getProducts error:', err);
    return null;
  }
}

export async function saveProducts(productsData: any) {
  try {
    const { error } = await supabase
      .from('products')
      .upsert({ id: 'main_menu', data: productsData, updated_at: new Date().toISOString() });

    if (error) {
      console.error('Supabase save error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase saveProducts error:', err);
    return false;
  }
}
