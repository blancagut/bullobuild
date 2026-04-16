import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs';
const sb = createClient('https://yxwqjrgcowcsovktmkzl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d3Fqcmdjb3djc292a3Rta3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI1NTAxMSwiZXhwIjoyMDkxODMxMDExfQ._QFQ8i4PKIpP-suSp6LbqD9V5NRGgzXZ-HTw6ovFzWs', {auth:{persistSession:false}});
// Get brand id for bobcat
const {data: brand} = await sb.from('brands').select('id').eq('slug','bobcat').single();
// Get a few products for this brand
const {data: prods} = await sb.from('products').select('id,name,slug,model').eq('brand_id', brand.id).limit(5);
console.log('Bobcat products in DB:');
prods.forEach(p => console.log(`  name="${p.name}" slug="${p.slug}" model="${p.model}"`));
