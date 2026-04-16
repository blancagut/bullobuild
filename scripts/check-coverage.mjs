import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs';
const sb = createClient('https://yxwqjrgcowcsovktmkzl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d3Fqcmdjb3djc292a3Rta3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI1NTAxMSwiZXhwIjoyMDkxODMxMDExfQ._QFQ8i4PKIpP-suSp6LbqD9V5NRGgzXZ-HTw6ovFzWs', {auth:{persistSession:false}});

const {count: nullCount} = await sb.from('products').select('*', {count:'exact',head:true}).is('category_id', null);
const {count: total} = await sb.from('products').select('*', {count:'exact',head:true});
console.log(`Total: ${total}  |  With category: ${total - nullCount}  |  Still NULL: ${nullCount}`);

const {data} = await sb.from('categories').select('name, slug').order('name');
console.log(`\nCategories in DB: ${data.length}`);

// top categories by product count
const {data: top} = await sb.rpc('_sql' , {}).catch(async () => {
  // fallback: just list categories
  return {data: null};
});
