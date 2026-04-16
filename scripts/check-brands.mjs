import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs';
const sb = createClient('https://yxwqjrgcowcsovktmkzl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d3Fqcmdjb3djc292a3Rta3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI1NTAxMSwiZXhwIjoyMDkxODMxMDExfQ._QFQ8i4PKIpP-suSp6LbqD9V5NRGgzXZ-HTw6ovFzWs', {auth:{persistSession:false}});
const {data} = await sb.from('brands').select('id, name, slug').order('name');
data.forEach(b => console.log(`"${b.slug}" → ${b.name}`));
// Also check null category count
const {count} = await sb.from('products').select('*', {count:'exact', head:true}).is('category_id', null);
console.log(`\nProducts with null category_id: ${count}`);
