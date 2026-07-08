-- Database Creation
CREATE DATABASE IF NOT EXISTS curvy_comfort;
USE curvy_comfort;

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) DEFAULT NULL,
    category VARCHAR(50) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 4.5,
    reviews_count INT DEFAULT 0,
    image LONGTEXT NOT NULL, -- To support Base64 images directly
    badge VARCHAR(50) DEFAULT '',
    is_new BOOLEAN DEFAULT FALSE
);

-- 2. Branding Settings Table
CREATE TABLE IF NOT EXISTS branding (
    `key` VARCHAR(50) PRIMARY KEY,
    `value` LONGTEXT NOT NULL
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    items_json TEXT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
