USE distribuidora;

-- =========================================================
-- ADDITIONAL INDEXES
-- =========================================================

-- Ventas por fecha / período
CREATE INDEX idx_orders_date
    ON orders(date);

-- Compras por fecha / período
CREATE INDEX idx_purchases_date
    ON purchases(date);