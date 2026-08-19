USE distribuidora;


-- =========================================================
-- ADMIN USER
-- =========================================================


INSERT INTO users (
    name,
    email,
    password,
    role,
    active,
    created_at,
    created_by
)
VALUES (
    'Administrador',
    'admin@distribuidora.com',
    '',
    'ADMIN',
    1,
    NOW(),
    1
);

-- =========================================================
-- PAYMENT METHODS
-- =========================================================

INSERT INTO payment_methods (name, active, created_by)
VALUES
    ('Efectivo', TRUE,1),
    ('Transferencia', TRUE,1),
    ('Tarjeta de débito', TRUE,1),
    ('Tarjeta de crédito', TRUE,1);
    
