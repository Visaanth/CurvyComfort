import os
import json
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

# Load local environment variables if present
load_dotenv()

app = Flask(__name__)
# Enable CORS for frontend development
CORS(app)

# Database Configuration
# First try DATABASE_URL (standard for Vercel / Heroku / Cloud hosting)
db_url = os.environ.get('DATABASE_URL')
if not db_url:
    # Build default connection string for local MySQL
    db_user = os.environ.get('DB_USER', 'root')
    db_password = os.environ.get('DB_PASSWORD', '')
    db_host = os.environ.get('DB_HOST', 'localhost')
    db_port = os.environ.get('DB_PORT', '3306')
    db_name = os.environ.get('DB_NAME', 'curvy_comfort')
    # Use PyMySQL driver for Python MySQL connectivity
    db_url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False

db = SQLAlchemy(app)

# --- DATABASE MODELS ---

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    original_price = db.Column(db.Numeric(10, 2), nullable=True)
    category = db.Column(db.String(50), nullable=False)
    rating = db.Column(db.Numeric(3, 2), default=4.5)
    reviews_count = db.Column(db.Integer, default=0)
    image = db.Column(db.LongText, nullable=False)  # Stores path or base64 data URL
    badge = db.Column(db.String(50), default='')
    is_new = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': float(self.price),
            'originalPrice': float(self.original_price) if self.original_price is not None else None,
            'category': self.category,
            'rating': float(self.rating) if self.rating else 4.5,
            'reviewsCount': self.reviews_count,
            'image': self.image,
            'badge': self.badge,
            'isNew': self.is_new
        }

class Branding(db.Model):
    __tablename__ = 'branding'
    key = db.Column(db.String(50), primary_key=True)
    value = db.Column(db.LongText, nullable=False)  # Base64 image data URL

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    items_json = db.Column(db.Text, nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'items': json.loads(self.items_json),
            'total_price': float(self.total_price),
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

# --- SEED DEFAULT PRODUCTS ---
DEFAULT_PRODUCTS = [
    {
        "id": "p1",
        "name": "Vibrant Maroon Anarkali Set",
        "price": 3499.00,
        "original_price": 4299.00,
        "category": "ethnic",
        "rating": 4.9,
        "reviews_count": 124,
        "image": "/ethnic_wear.png",
        "badge": "Best Seller",
        "is_new": False
    },
    {
        "id": "p2",
        "name": "Floral Cotton Kurta Set",
        "price": 1599.00,
        "original_price": 1999.00,
        "category": "casual",
        "rating": 4.7,
        "reviews_count": 86,
        "image": "/casual_wear.png",
        "badge": "",
        "is_new": True
    },
    {
        "id": "p3",
        "name": "Royal Red & Gold Lehenga",
        "price": 4599.00,
        "original_price": 5999.00,
        "category": "party",
        "rating": 5.0,
        "reviews_count": 62,
        "image": "/party_wear.png",
        "badge": "Exclusive",
        "is_new": False
    },
    {
        "id": "p5",
        "name": "Emerald Green Ready-Made Blouse",
        "price": 1499.00,
        "original_price": 1899.00,
        "category": "blouse",
        "rating": 4.9,
        "reviews_count": 93,
        "image": "/readymade_blouse.png",
        "badge": "Sale",
        "is_new": True
    },
    {
        "id": "p6",
        "name": "Cotton Motif Loungewear Co-ord Set",
        "price": 2299.00,
        "original_price": 2799.00,
        "category": "loungewear",
        "rating": 4.6,
        "reviews_count": 78,
        "image": "/loungewear.png",
        "badge": "",
        "is_new": False
    },
    {
        "id": "p7",
        "name": "Golden Embroidered Kurti",
        "price": 2199.00,
        "original_price": 2599.00,
        "category": "ethnic",
        "rating": 4.8,
        "reviews_count": 110,
        "image": "/ethnic_wear.png",
        "badge": "",
        "is_new": True
    },
    {
        "id": "p8",
        "name": "Printed Cotton Kurta & Palazzo",
        "price": 1899.00,
        "original_price": 2299.00,
        "category": "casual",
        "rating": 4.7,
        "reviews_count": 57,
        "image": "/casual_wear.png",
        "badge": "",
        "is_new": False
    }
]

def seed_db():
    try:
        # Check if products already exist
        if Product.query.count() == 0:
            for p in DEFAULT_PRODUCTS:
                db.session.add(Product(
                    id=p['id'],
                    name=p['name'],
                    price=p['price'],
                    original_price=p['original_price'],
                    category=p['category'],
                    rating=p['rating'],
                    reviews_count=p['reviews_count'],
                    image=p['image'],
                    badge=p['badge'],
                    is_new=p['is_new']
                ))
            db.session.commit()
            print("Database successfully seeded with default products!")
    except Exception as e:
        print(f"Error seeding database: {e}")

# Try to initialize database tables
try:
    with app.app_context():
        db.create_all()
        seed_db()
except Exception as e:
    print(f"Database connection failed or tables already exist. Error: {e}")


# --- API ROUTES ---

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "database": "connected"}), 200

# Products Endpoints
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        products = Product.query.all()
        return jsonify([p.to_dict() for p in products]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products', methods=['POST'])
def add_product():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON request body"}), 400
        
        # Validation
        required_fields = ['name', 'price', 'category', 'image']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"Field '{field}' is required"}), 400

        product_id = data.get('id') or f"p_{int(db.func.now())}" # fallback
        
        new_product = Product(
            id=product_id,
            name=data['name'],
            price=data['price'],
            original_price=data.get('originalPrice'),
            category=data['category'],
            rating=data.get('rating', 4.8),
            reviews_count=data.get('reviewsCount', 1),
            image=data['image'],
            badge=data.get('badge', ''),
            is_new=data.get('isNew', True)
        )
        
        db.session.add(new_product)
        db.session.commit()
        return jsonify(new_product.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/<id>', methods=['PUT'])
def update_product(id):
    try:
        data = request.get_json()
        product = Product.query.get(id)
        if not product:
            return jsonify({"error": f"Product with ID {id} not found"}), 404
        
        if 'name' in data: product.name = data['name']
        if 'price' in data: product.price = data['price']
        if 'category' in data: product.category = data['category']
        if 'badge' in data: product.badge = data['badge']
        if 'image' in data and data['image']: product.image = data['image']
        if 'originalPrice' in data: product.original_price = data['originalPrice']
        if 'isNew' in data: product.is_new = data['isNew']
        
        db.session.commit()
        return jsonify(product.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/<id>', methods=['DELETE'])
def delete_product(id):
    try:
        product = Product.query.get(id)
        if not product:
            return jsonify({"error": f"Product with ID {id} not found"}), 404
        
        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Product deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Branding Endpoints
@app.route('/api/branding', methods=['GET'])
def get_branding():
    try:
        logo_rec = Branding.query.get('brand_logo')
        hero_rec = Branding.query.get('brand_hero')
        
        return jsonify({
            "brand_logo": logo_rec.value if logo_rec else None,
            "brand_hero": hero_rec.value if hero_rec else None
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/branding', methods=['POST'])
def update_branding():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON request body"}), 400
        
        if 'brand_logo' in data and data['brand_logo']:
            logo = Branding.query.get('brand_logo')
            if logo:
                logo.value = data['brand_logo']
            else:
                db.session.add(Branding(key='brand_logo', value=data['brand_logo']))

        if 'brand_hero' in data and data['brand_hero']:
            hero = Branding.query.get('brand_hero')
            if hero:
                hero.value = data['brand_hero']
            else:
                db.session.add(Branding(key='brand_hero', value=data['brand_hero']))
                
        db.session.commit()
        return jsonify({"message": "Branding updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Admin Login Endpoint
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON body"}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        # Standard administrative credentials matching frontend configuration
        # Can be customized via environment variables on server/Vercel
        expected_email = os.environ.get('ADMIN_EMAIL', 'admin@curvycomfort@gmail.com')
        expected_password = os.environ.get('ADMIN_PASSWORD', 'CurComf2026')
        
        if email == expected_email and password == expected_password:
            return jsonify({"success": True, "message": "Admin session authenticated successfully"}), 200
        else:
            return jsonify({"success": False, "error": "Invalid email or password credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Orders Endpoints
@app.route('/api/orders', methods=['POST'])
def create_order():
    try:
        data = request.get_json()
        if not data or 'items' not in data or 'total_price' not in data:
            return jsonify({"error": "Invalid order details"}), 400
        
        new_order = Order(
            items_json=json.dumps(data['items']),
            total_price=data['total_price']
        )
        
        db.session.add(new_order)
        db.session.commit()
        return jsonify(new_order.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Standalone development entry point (fallback when not running as a Vercel serverless function)
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
