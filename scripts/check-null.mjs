import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs';
const sb = createClient('https://yxwqjrgcowcsovktmkzl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d3Fqcmdjb3djc292a3Rta3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI1NTAxMSwiZXhwIjoyMDkxODMxMDExfQ._QFQ8i4PKIpP-suSp6LbqD9V5NRGgzXZ-HTw6ovFzWs', {auth:{persistSession:false}});

// Get null-category products grouped by brand
const {data: brands} = await sb.from('brands').select('id, name, slug');
for (const b of brands) {
  const {count} = await sb.from('products').select('*',{count:'exact',head:true}).eq('brand_id',b.id).is('category_id',null);
  if (count > 0) {
    // sample a few titles
    const {data: samples} = await sb.from('products').select('name,model').eq('brand_id',b.id).is('category_id',null).limit(3);
    console.log(`${b.slug}: ${count} NULL`);
    samples.forEach(p => console.log(`  "${p.name.substring(0,70)}"`));
  }
}
