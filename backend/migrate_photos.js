import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const bucketName = process.env.SUPABASE_BUCKET || 'imgs';

const pgClient = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const filesToMigrate = [
  { localName: 'ethnic_wear.png', destPath: 'product_imgs/ethnic_wear.png', isProduct: true },
  { localName: 'casual_wear.png', destPath: 'product_imgs/casual_wear.png', isProduct: true },
  { localName: 'party_wear.png', destPath: 'product_imgs/party_wear.png', isProduct: true },
  { localName: 'readymade_blouse.png', destPath: 'product_imgs/readymade_blouse.png', isProduct: true },
  { localName: 'loungewear.png', destPath: 'product_imgs/loungewear.png', isProduct: true },
  { localName: 'logo.jpg', destPath: 'branding/logo.jpg', isBranding: true, brandingKey: 'brand_logo' },
  { localName: 'hero_banner.png', destPath: 'branding/hero_banner.png', isBranding: true, brandingKey: 'brand_hero' }
];

async function run() {
  console.log('Connecting to PostgreSQL database...');
  await pgClient.connect();

  console.log('Starting migration of local photos to Supabase Storage...');
  
  const publicUrls = {};

  for (const file of filesToMigrate) {
    const localFilePath = path.join('..', 'frontend', 'public', file.localName);
    
    if (!fs.existsSync(localFilePath)) {
      console.warn(`⚠️ Warning: Local file not found: ${localFilePath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(localFilePath);
    let mimeType = 'image/png';
    if (file.localName.endsWith('.jpg') || file.localName.endsWith('.jpeg')) {
      mimeType = 'image/jpeg';
    }

    console.log(`Uploading ${file.localName} to Supabase bucket "${bucketName}" folder "${file.destPath.split('/')[0]}"...`);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(file.destPath, fileBuffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.error(`❌ Failed to upload ${file.localName}: ${error.message}`);
      console.error('Ensure your Supabase storage bucket RLS policies allow uploads (or use the service_role key).');
      process.exit(1);
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(file.destPath);

    console.log(`✅ Uploaded! Public URL: ${publicUrlData.publicUrl}`);
    publicUrls[file.localName] = publicUrlData.publicUrl;
  }

  console.log('\nUpdating PostgreSQL database records with public URLs...');

  // Update default products
  const productMappings = [
    { id: 'p1', image: 'ethnic_wear.png' },
    { id: 'p2', image: 'casual_wear.png' },
    { id: 'p3', image: 'party_wear.png' },
    { id: 'p5', image: 'readymade_blouse.png' },
    { id: 'p6', image: 'loungewear.png' },
    { id: 'p7', image: 'ethnic_wear.png' },
    { id: 'p8', image: 'casual_wear.png' }
  ];

  for (const mapping of productMappings) {
    const publicUrl = publicUrls[mapping.image];
    if (publicUrl) {
      await pgClient.query('UPDATE products SET image = $1 WHERE id = $2', [publicUrl, mapping.id]);
      console.log(`Updated product ${mapping.id} with bucket URL.`);
    }
  }

  // Update default branding (brand_logo and brand_hero)
  const brandingLogoUrl = publicUrls['logo.jpg'];
  if (brandingLogoUrl) {
    await pgClient.query(
      `INSERT INTO branding (key, value) VALUES ('brand_logo', $1) 
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, 
      [brandingLogoUrl]
    );
    console.log('Updated branding brand_logo with bucket URL.');
  }

  const brandingHeroUrl = publicUrls['hero_banner.png'];
  if (brandingHeroUrl) {
    await pgClient.query(
      `INSERT INTO branding (key, value) VALUES ('brand_hero', $1) 
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, 
      [brandingHeroUrl]
    );
    console.log('Updated branding brand_hero with bucket URL.');
  }

  await pgClient.end();
  console.log('\n🎉 Migration completed successfully!');
}

run().catch(err => {
  console.error('Fatal error during migration:', err);
  try { pgClient.end(); } catch (_) {}
});
