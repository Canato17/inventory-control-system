const db = require('../config/database');

// GET /api/products - Listar todos os produtos
const getAllProducts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Erro em getAllProducts:', error);
        res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
    }
};

// GET /api/products/:id - Buscar produto por ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        
        // Buscar matérias-primas do produto
        const [materials] = await db.query(`
            SELECT rm.*, prm.quantity_needed 
            FROM raw_materials rm
            JOIN product_raw_materials prm ON rm.id = prm.raw_material_id
            WHERE prm.product_id = ?
        `, [id]);
        
        res.json({
            ...rows[0],
            raw_materials: materials
        });
    } catch (error) {
        console.error('Erro em getProductById:', error);
        res.status(500).json({ message: 'Erro ao buscar produto', error: error.message });
    }
};

// POST /api/products - Criar novo produto
const createProduct = async (req, res) => {
    try {
        const { name, value } = req.body;
        
        if (!name || !value) {
            return res.status(400).json({ message: 'Nome e valor são obrigatórios' });
        }
        
        const [result] = await db.query(
            'INSERT INTO products (name, value) VALUES (?, ?)',
            [name, value]
        );
        
        res.status(201).json({
            id: result.insertId,
            name,
            value,
            message: 'Produto criado com sucesso'
        });
    } catch (error) {
        console.error('Erro em createProduct:', error);
        res.status(500).json({ message: 'Erro ao criar produto', error: error.message });
    }
};

// PUT /api/products/:id - Atualizar produto
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, value } = req.body;
        
        const [result] = await db.query(
            'UPDATE products SET name = ?, value = ? WHERE id = ?',
            [name, value, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        
        res.json({ message: 'Produto atualizado com sucesso' });
    } catch (error) {
        console.error('Erro em updateProduct:', error);
        res.status(500).json({ message: 'Erro ao atualizar produto', error: error.message });
    }
};

// DELETE /api/products/:id - Deletar produto
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        
        res.json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
        console.error('Erro em deleteProduct:', error);
        res.status(500).json({ message: 'Erro ao deletar produto', error: error.message });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};