CREATE DATABASE IF NOT EXISTS inventory_control;
USE inventory_control;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS raw_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_raw_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    raw_material_id INT NOT NULL,
    quantity_needed INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_raw_material (product_id, raw_material_id)
);

INSERT INTO raw_materials (name, stock_quantity) VALUES
('Madeira', 100),
('Parafuso', 500),
('Tinta', 50),
('Tecido', 30),
('Plástico', 200);

INSERT INTO products (name, value) VALUES
('Mesa', 350.00),
('Cadeira', 150.00),
('Armário', 800.00),
('Cortina', 120.00);


INSERT INTO product_raw_materials (product_id, raw_material_id, quantity_needed) VALUES
(1, 1, 10), 
(1, 2, 20),  
(1, 3, 1),   
(2, 1, 5),   
(2, 2, 10),  
(3, 1, 20),  
(3, 2, 30),  
(3, 3, 2),   
(4, 4, 5);   

-- View para ver produtos com suas matérias-primas
CREATE VIEW vw_products_with_materials AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.value AS product_value,
    rm.id AS raw_material_id,
    rm.name AS raw_material_name,
    rm.stock_quantity AS current_stock,
    prm.quantity_needed AS quantity_needed_per_product
FROM products p
JOIN product_raw_materials prm ON p.id = prm.product_id
JOIN raw_materials rm ON prm.raw_material_id = rm.id;

-- View para calcular quantos produtos podem ser feitos com o estoque atual
CREATE VIEW vw_production_possibility AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.value AS product_value,
    MIN(FLOOR(rm.stock_quantity / prm.quantity_needed)) AS max_possible_quantity
FROM products p
JOIN product_raw_materials prm ON p.id = prm.product_id
JOIN raw_materials rm ON prm.raw_material_id = rm.id
GROUP BY p.id, p.name, p.value;

INSERT INTO raw_materials (name, stock_quantity) VALUES
('Madeira', 100),
('Parafuso', 500),
('Tinta', 50),
('Tecido', 30),
('Plástico', 200);

UPDATE raw_materials SET stock_quantity = 50 WHERE id = 1; -- Madeira: 50
UPDATE raw_materials SET stock_quantity = 100 WHERE id = 2; -- Parafuso: 100
UPDATE raw_materials SET stock_quantity = 10 WHERE id = 3; -- Tinta: 10
UPDATE raw_materials SET stock_quantity = 20 WHERE id = 4; -- Tecido: 20
UPDATE raw_materials SET stock_quantity = 200 WHERE id = 5; -- Plástico: 200