USE distribuidora;

-- =========================================================
-- CATEGORY
-- =========================================================

INSERT INTO categories (
    name,
    active,
    created_at,
    created_by
)
VALUES (
    'Bebidas - TEST',
    1,
    NOW(),
    1
);

SET @category_id = LAST_INSERT_ID();


-- =========================================================
-- BRAND
-- =========================================================

INSERT INTO brands (
    name,
    active,
    created_at,
    created_by
)
VALUES (
    'Marca TEST',
    1,
    NOW(),
    1
);

SET @brand_id = LAST_INSERT_ID();


-- =========================================================
-- CUSTOMER
-- =========================================================

INSERT INTO customers (
    name,
    document,
    phone,
    email,
    address,
    city,
    observations,
    active,
    created_at,
    created_by
)
VALUES (
    'Cliente de Prueba',
    'TEST-0001',
    '1111111111',
    'cliente.test@example.com',
    'Dirección de Prueba 123',
    'Buenos Aires',
    'Cliente generado para pruebas.',
    1,
    NOW(),
    1
);

SET @customer_id = LAST_INSERT_ID();


-- =========================================================
-- VENDOR
-- =========================================================

INSERT INTO vendors (
    name,
    phone,
    email,
    address,
    city,
    observations,
    active,
    created_at,
    created_by
)
VALUES (
    'Proveedor de Prueba',
    '2222222222',
    'vendor.test@example.com',
    'Dirección del Proveedor 456',
    'Buenos Aires',
    'Proveedor generado para pruebas.',
    1,
    NOW(),
    1
);

SET @vendor_id = LAST_INSERT_ID();


-- =========================================================
-- PAYMENT METHOD
-- =========================================================

INSERT INTO payment_methods (
    name,
    active,
    created_at,
    created_by
)
VALUES (
    'Efectivo - TEST',
    1,
    NOW(),
    1
);

SET @payment_method_id = LAST_INSERT_ID();

-- =========================================================
-- PRODUCT
-- =========================================================

INSERT INTO products (
    code,
    barcode,
    description,
    category_id,
    brand_id,
    purchase_price,
    sale_price,
    stock,
    minimum_stock,
    active,
    created_at,
    created_by
)
VALUES (
    'TEST-0001',
    '779000000001',
    'Producto de Prueba',
    @category_id,
    @brand_id,
    1000.00,
    1500.00,
    100,
    10,
    1,
    NOW(),
    1
);

SET @product_id = LAST_INSERT_ID();

-- =========================================================
-- PURCHASE
-- =========================================================

INSERT INTO purchases (
    number,
    vendor_id,
    date,
    total,
    observations,
    cancelled,
    created_at,
    created_by
)
VALUES (
    1001,
    @vendor_id,
    '2026-08-18',
    100000.00,
    'Compra de prueba.',
    0,
    NOW(),
    1
);

SET @purchase_id = LAST_INSERT_ID();

-- =========================================================
-- PURCHASE DETAIL
-- =========================================================

INSERT INTO purchase_details (
    purchase_id,
    product_id,
    quantity,
    purchase_price,
    subtotal
)
VALUES (
    @purchase_id,
    @product_id,
    100,
    1000.00,
    100000.00
);

SET @purchase_detail_id = LAST_INSERT_ID();

-- =========================================================
-- ORDER
-- =========================================================

INSERT INTO orders (
    number,
    customer_id,
    seller_id,
    payment_method_id,
    date,
    total,
    cancelled,
    created_at,
    created_by
)
VALUES (
    1,
    @customer_id,
    1,
    @payment_method_id,
    '2026-08-18',
    7500.00,
    0,
    NOW(),
    1
);

SET @order_id = LAST_INSERT_ID();

-- =========================================================
-- ORDER DETAIL
-- =========================================================

INSERT INTO order_details (
    order_id,
    product_id,
    quantity,
    sale_price,
    purchase_price,
    subtotal
)
VALUES (
    @order_id,
    @product_id,
    5,
    1500.00,
    1000.00,
    7500.00
);

SET @order_detail_id = LAST_INSERT_ID();

-- =========================================================
-- STOCK MOVEMENTS
-- =========================================================

INSERT INTO stock_movements (
    product_id,
    type,
    quantity,
    reference_id
)
VALUES (
    @product_id,
    'Purchase',
    100,
    @purchase_id
);

INSERT INTO stock_movements (
    product_id,
    type,
    quantity,
    reference_id
)
VALUES (
    @product_id,
    'Sale',
    5,
    @order_id
);