USE distribuidora;

-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
	modified_at DATETIME NULL,
	modified_by INT NULL,

    CONSTRAINT uq_users_email UNIQUE (email)
);

-- =========================================================
-- CATEGORIES
-- =========================================================

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
	active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
	modified_at DATETIME NULL,
	modified_by INT NULL,

    CONSTRAINT uq_categories_name UNIQUE (name)
);

-- =========================================================
-- BRANDS
-- =========================================================

CREATE TABLE brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
	active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
	modified_at DATETIME NULL,
	modified_by INT NULL,
	
    CONSTRAINT uq_brands_name UNIQUE (name)
);

-- =========================================================
-- CUSTOMERS
-- =========================================================

CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    document VARCHAR(30) NOT NULL,
    phone VARCHAR(30) NULL,
    email VARCHAR(150) NULL,
    address VARCHAR(250) NULL,
    city VARCHAR(100) NULL,
    observations VARCHAR(1500) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
	modified_at DATETIME NULL,
	modified_by INT NULL,

    CONSTRAINT uq_customers_document UNIQUE (document)
);

-- =========================================================
-- VENDORS
-- =========================================================

CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NULL,
    email VARCHAR(150) NULL,
    address VARCHAR(250) NULL,
    city VARCHAR(100) NULL,
    observations VARCHAR(1500) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
	modified_at DATETIME NULL,
	modified_by INT NULL
);

-- =========================================================
-- PAYMENT METHODS
-- =========================================================

CREATE TABLE payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
	modified_at DATETIME NULL,
	modified_by INT NULL,
	
    CONSTRAINT uq_payment_methods_name UNIQUE (name)
);

-- =========================================================
-- PRODUCTS
-- =========================================================

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL,
    barcode VARCHAR(30) NULL,
    description VARCHAR(200) NOT NULL,
    category_id INT NOT NULL,
    brand_id INT NOT NULL,
    purchase_price DECIMAL(12,2) NOT NULL,
    sale_price DECIMAL(12,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
	modified_at DATETIME NULL,
	modified_by INT NULL,
	
    CONSTRAINT uq_products_code UNIQUE (code),
    CONSTRAINT uq_products_barcode UNIQUE (barcode),

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id),

    CONSTRAINT fk_products_brand
        FOREIGN KEY (brand_id)
        REFERENCES brands(id),

    CONSTRAINT chk_products_purchase_price
        CHECK (purchase_price >= 0),

    CONSTRAINT chk_products_sale_price
        CHECK (sale_price >= 0),

    CONSTRAINT chk_products_stock
        CHECK (stock >= 0),

    CONSTRAINT chk_products_minimum_stock
        CHECK (minimum_stock >= 0)
);

-- =========================================================
-- PURCHASES
-- =========================================================

CREATE TABLE purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number INT NOT NULL,
    vendor_id INT NOT NULL,
    date DATETIME NOT NULL,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    observations VARCHAR(1500) NULL,
    cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
	modified_at DATETIME NULL,
	modified_by INT NULL,

    CONSTRAINT uq_purchases_vendor_number
        UNIQUE (vendor_id, number),

    CONSTRAINT fk_purchases_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES vendors(id),

    CONSTRAINT chk_purchases_total
        CHECK (total >= 0)
);

-- =========================================================
-- PURCHASE DETAILS
-- =========================================================

CREATE TABLE purchase_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    purchase_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,

    CONSTRAINT uq_purchase_details_product
        UNIQUE (purchase_id, product_id),

    CONSTRAINT fk_purchase_details_purchase
        FOREIGN KEY (purchase_id)
        REFERENCES purchases(id),

    CONSTRAINT fk_purchase_details_product
        FOREIGN KEY (product_id)
        REFERENCES products(id),

    CONSTRAINT chk_purchase_details_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_purchase_details_price
        CHECK (purchase_price >= 0),

    CONSTRAINT chk_purchase_details_subtotal
        CHECK (subtotal >= 0)
);

-- =========================================================
-- ORDERS
-- =========================================================

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number INT NOT NULL,
    customer_id INT NOT NULL,
    seller_id INT NOT NULL,
    payment_method_id INT NOT NULL,
    date DATETIME NOT NULL,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    observations VARCHAR(1500) NULL,
    cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
	modified_at DATETIME NULL,
	modified_by INT NULL,
	
    CONSTRAINT uq_orders_number UNIQUE (number),

    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id),

    CONSTRAINT fk_orders_seller
        FOREIGN KEY (seller_id)
        REFERENCES users(id),

    CONSTRAINT fk_orders_payment_method
        FOREIGN KEY (payment_method_id)
        REFERENCES payment_methods(id),

    CONSTRAINT chk_orders_total
        CHECK (total >= 0)
);

-- =========================================================
-- ORDER DETAILS
-- =========================================================

CREATE TABLE order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    sale_price DECIMAL(12,2) NOT NULL,
    purchase_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,

    CONSTRAINT uq_order_details_product
        UNIQUE (order_id, product_id),

    CONSTRAINT fk_order_details_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id),

    CONSTRAINT fk_order_details_product
        FOREIGN KEY (product_id)
        REFERENCES products(id),

    CONSTRAINT chk_order_details_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_order_details_sale_price
        CHECK (sale_price >= 0),

    CONSTRAINT chk_order_details_purchase_price
        CHECK (purchase_price >= 0),

    CONSTRAINT chk_order_details_subtotal
        CHECK (subtotal >= 0)
);

-- =========================================================
-- STOCK MOVEMENTS
-- =========================================================

CREATE TABLE stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    type VARCHAR(30) NOT NULL,
    quantity INT NOT NULL,
    reference_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
	modified_at DATETIME NULL,
	modified_by INT NULL,

    CONSTRAINT fk_stock_movements_product
        FOREIGN KEY (product_id)
        REFERENCES products(id),

    CONSTRAINT chk_stock_movements_quantity
        CHECK (quantity > 0)
);

-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_products_category
    ON products(category_id);

CREATE INDEX idx_products_brand
    ON products(brand_id);

CREATE INDEX idx_purchases_vendor
    ON purchases(vendor_id);

CREATE INDEX idx_purchase_details_product
    ON purchase_details(product_id);

CREATE INDEX idx_orders_customer
    ON orders(customer_id);

CREATE INDEX idx_orders_seller
    ON orders(seller_id);

CREATE INDEX idx_orders_payment_method
    ON orders(payment_method_id);

CREATE INDEX idx_order_details_product
    ON order_details(product_id);

CREATE INDEX idx_stock_movements_product
    ON stock_movements(product_id);

CREATE INDEX idx_stock_movements_reference
    ON stock_movements(reference_id);