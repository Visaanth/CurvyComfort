import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Sequelize, DataTypes } from 'sequelize';
import { createClient } from '@supabase/supabase-js';
import { Buffer } from 'buffer';
import dns from 'dns';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix for IPv6 host resolution (e.g. Supabase direct DB connections)
dns.setDefaultResultOrder('verbatim');

// Load environment variables relative to server.js directory
dotenv.config({ path: path.resolve(__dirname, '.env') });


const app = express();
const PORT = process.env.PORT || 5000;

// Increase JSON limit to handle large base64 image uploads for products and branding
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// --- DATABASE CONFIGURATION ---
const dbUrl = process.env.DATABASE_URL;
let sequelize;

const sslConfig = {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
};

if (dbUrl) {
  // Normalize connection protocol to standard postgresql://
  const cleanUrl = dbUrl.replace('mysql+pymysql://', 'postgresql://').replace('mysql://', 'postgresql://');
  sequelize = new Sequelize(cleanUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ...sslConfig,
      connectTimeout: 5000
    }
  });
} else {
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '5432';
  const dbName = process.env.DB_NAME || 'postgres';

  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ...sslConfig,
      connectTimeout: 5000
    }
  });
}

// --- DATABASE MODELS ---

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('price');
      return rawValue === null ? null : parseFloat(rawValue);
    }
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'original_price',
    get() {
      const rawValue = this.getDataValue('originalPrice');
      return rawValue === null ? null : parseFloat(rawValue);
    }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 4.5,
    get() {
      const rawValue = this.getDataValue('rating');
      return rawValue === null ? 4.5 : parseFloat(rawValue);
    }
  },
  reviewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'reviews_count'
  },
  image: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  badge: {
    type: DataTypes.STRING(50),
    defaultValue: ''
  },
  isNew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_new'
  }
}, {
  tableName: 'products',
  timestamps: false
});

const Branding = sequelize.define('Branding', {
  key: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  value: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  }
}, {
  tableName: 'branding',
  timestamps: false
});

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  itemsJson: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'items_json'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_price',
    get() {
      const rawValue = this.getDataValue('totalPrice');
      return rawValue === null ? null : parseFloat(rawValue);
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    field: 'created_at'
  }
}, {
  tableName: 'orders',
  timestamps: false
});

// --- SUPABASE CLIENT & IMAGE UPLOADER ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

async function uploadBase64Image(base64Str, folder = 'product_imgs') {
  if (!base64Str || !base64Str.startsWith('data:')) {
    return base64Str; // Return as is if already a URL or empty
  }
  if (!supabase) {
    console.warn('Supabase client not initialized, storing as base64 instead.');
    return base64Str;
  }

  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 string format');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('jpeg')) ext = 'jpg';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';

    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET || 'imgs')
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      throw new Error(`Supabase storage upload error: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(process.env.SUPABASE_BUCKET || 'imgs')
      .getPublicUrl(filename);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error uploading image to Supabase:', err);
    return base64Str; // Fallback to storing as base64 if upload fails
  }
}

async function deleteImageFromSupabase(imageUrl) {
  if (!imageUrl || !supabase) return;

  const bucketName = process.env.SUPABASE_BUCKET || 'imgs';
  
  // We check if the URL contains the supabase domain and bucket name
  if (imageUrl.includes('supabase.co') && imageUrl.includes(`/public/${bucketName}/`)) {
    // Extract file path after `/public/imgs/`
    const parts = imageUrl.split(`/public/${bucketName}/`);
    if (parts.length === 2) {
      const filepath = decodeURIComponent(parts[1]);
      console.log(`Deleting file from Supabase storage: ${filepath}`);
      const { error } = await supabase.storage.from(bucketName).remove([filepath]);
      if (error) {
        console.error(`Failed to delete file from Supabase storage: ${error.message}`);
      } else {
        console.log(`Successfully deleted file from Supabase storage: ${filepath}`);
      }
    }
  }
}

// Helper method to convert Order to client response format
const serializeOrder = (order) => {
  let items = [];
  try {
    items = JSON.parse(order.itemsJson);
  } catch (err) {
    items = order.itemsJson;
  }
  return {
    id: order.id,
    items,
    total_price: order.totalPrice,
    created_at: order.createdAt
  };
};

// Initialize connection and sync tables
try {
  await sequelize.authenticate();
  console.log('Database connection has been established successfully.');
  
  // Sync schemas with Postgres database (create tables if they do not exist)
  await sequelize.sync();
} catch (err) {
  console.error('Database connection failed or tables already exist. Error:', err);
}

// --- API ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "healthy", database: "connected" });
});

// Products Endpoints
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ error: "Missing JSON request body" });
    }

    const requiredFields = ['name', 'price', 'category', 'image'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ error: `Field '${field}' is required` });
      }
    }

    const productId = data.id || `p_${Date.now()}`;

    // Upload base64 image to Supabase bucket if applicable
    const imageUrl = await uploadBase64Image(data.image, 'product_imgs');

    const newProduct = await Product.create({
      id: productId,
      name: data.name,
      price: data.price,
      originalPrice: data.originalPrice || null,
      category: data.category,
      rating: data.rating || 4.8,
      reviewsCount: data.reviewsCount || 1,
      image: imageUrl,
      badge: data.badge || '',
      isNew: data.isNew !== undefined ? data.isNew : true
    });

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ error: `Product with ID ${id} not found` });
    }

    if (data.name !== undefined) product.name = data.name;
    if (data.price !== undefined) product.price = data.price;
    if (data.category !== undefined) product.category = data.category;
    if (data.badge !== undefined) product.badge = data.badge;
    if (data.image !== undefined && data.image) {
      const imageUrl = await uploadBase64Image(data.image, 'product_imgs');
      product.image = imageUrl;
    }
    if (data.originalPrice !== undefined) product.originalPrice = data.originalPrice;
    if (data.isNew !== undefined) product.isNew = data.isNew;

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ error: `Product with ID ${id} not found` });
    }

    // Delete image from Supabase storage if it's stored there
    if (product.image) {
      await deleteImageFromSupabase(product.image);
    }

    await product.destroy();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Branding Endpoints
app.get('/api/branding', async (req, res) => {
  try {
    const logoRec = await Branding.findByPk('brand_logo');
    const heroRec = await Branding.findByPk('brand_hero');

    res.status(200).json({
      brand_logo: logoRec ? logoRec.value : null,
      brand_hero: heroRec ? heroRec.value : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/branding', async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ error: "Missing JSON request body" });
    }

    if ('brand_logo' in data) {
      if (data.brand_logo) {
        const logoUrl = await uploadBase64Image(data.brand_logo, 'branding');
        const [logo, created] = await Branding.findOrCreate({
          where: { key: 'brand_logo' },
          defaults: { value: logoUrl }
        });
        if (!created) {
          logo.value = logoUrl;
          await logo.save();
        }
      } else {
        const logo = await Branding.findByPk('brand_logo');
        if (logo) await logo.destroy();
      }
    }

    if ('brand_hero' in data) {
      if (data.brand_hero) {
        const heroUrl = await uploadBase64Image(data.brand_hero, 'branding');
        const [hero, created] = await Branding.findOrCreate({
          where: { key: 'brand_hero' },
          defaults: { value: heroUrl }
        });
        if (!created) {
          hero.value = heroUrl;
          await hero.save();
        }
      } else {
        const hero = await Branding.findByPk('brand_hero');
        if (hero) await hero.destroy();
      }
    }

    res.status(200).json({ message: "Branding updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Login Endpoint
app.post('/api/admin/login', (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ error: "Missing JSON body" });
    }

    const { email, password } = data;
    
    const expectedEmail = process.env.ADMIN_EMAIL || 'admin@curvycomfort.com';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'CurComf2026';

    console.log(`[Admin Auth] Attempted login email: "${email}". Expected email: "${expectedEmail}".`);

    const emailMatch = email && email.toLowerCase().trim() === expectedEmail.toLowerCase().trim();
    const passwordMatch = password && password.trim() === expectedPassword.trim();

    if (emailMatch && passwordMatch) {
      console.log(`[Admin Auth] Authentication successful for email: "${email}"`);
      res.status(200).json({ success: true, message: "Admin session authenticated successfully" });
    } else {
      console.warn(`[Admin Auth] Authentication failed. Email match: ${emailMatch}, Password match: ${passwordMatch}`);
      res.status(401).json({ success: false, error: "Invalid email or password credentials" });
    }
  } catch (err) {
    console.error(`[Admin Auth] Error occurred:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Orders Endpoints
app.post('/api/orders', async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.items || data.total_price === undefined) {
      return res.status(400).json({ error: "Invalid order details" });
    }

    const newOrder = await Order.create({
      itemsJson: JSON.stringify(data.items),
      totalPrice: data.total_price
    });

    res.status(201).json(serializeOrder(newOrder));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files from the React frontend build
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Support client-side routing by redirecting all other requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.resolve(frontendDistPath, 'index.html'));
});

// Export app for serverless environments (like Vercel)
export default app;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
