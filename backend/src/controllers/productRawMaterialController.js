const db = require('../config/database');

// POST /api/products/:productId/raw-materials - Associar matéria-prima
const associateRawMaterial = async (req, res) => {
    try {
        const { productId } = req.params;
        const { raw_material_id, quantity_needed } = req.body;
        
        if (!raw_material_id || !quantity_needed) {
            return res.status(400).json({ message: 'Matéria-prima e quantidade são obrigatórios' });
        }
        
        // Verificar se a associação já existe
        const [existing] = await db.query(
            'SELECT id FROM product_raw_materials WHERE product_id = ? AND raw_material_id = ?',
            [productId, raw_material_id]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Esta matéria-prima já está associada a este produto' });
        }
        
        const [result] = await db.query(
            'INSERT INTO product_raw_materials (product_id, raw_material_id, quantity_needed) VALUES (?, ?, ?)',
            [productId, raw_material_id, quantity_needed]
        );
        
        res.status(201).json({
            id: result.insertId,
            message: 'Matéria-prima associada com sucesso'
        });
    } catch (error) {
        console.error('Erro em associateRawMaterial:', error);
        res.status(500).json({ message: 'Erro ao associar matéria-prima', error: error.message });
    }
};

// GET /api/products/:productId/raw-materials - Listar matérias-primas do produto
const getProductRawMaterials = async (req, res) => {
    try {
        const { productId } = req.params;
        
        const [rows] = await db.query(`
            SELECT 
                rm.id,
                rm.name,
                rm.stock_quantity,
                prm.quantity_needed,
                prm.id as association_id
            FROM raw_materials rm
            JOIN product_raw_materials prm ON rm.id = prm.raw_material_id
            WHERE prm.product_id = ?
        `, [productId]);
        
        res.json(rows);
    } catch (error) {
        console.error('Erro em getProductRawMaterials:', error);
        res.status(500).json({ message: 'Erro ao buscar matérias-primas do produto', error: error.message });
    }
};

// PUT /api/products/:productId/raw-materials/:rawMaterialId - Atualizar quantidade
const updateQuantityNeeded = async (req, res) => {
    try {
        const { productId, rawMaterialId } = req.params;
        const { quantity_needed } = req.body;
        
        const [result] = await db.query(
            'UPDATE product_raw_materials SET quantity_needed = ? WHERE product_id = ? AND raw_material_id = ?',
            [quantity_needed, productId, rawMaterialId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Associação não encontrada' });
        }
        
        res.json({ message: 'Quantidade atualizada com sucesso' });
    } catch (error) {
        console.error('Erro em updateQuantityNeeded:', error);
        res.status(500).json({ message: 'Erro ao atualizar quantidade', error: error.message });
    }
};

// DELETE /api/products/:productId/raw-materials/:rawMaterialId - Remover associação
const removeRawMaterialAssociation = async (req, res) => {
    try {
        const { productId, rawMaterialId } = req.params;
        
        const [result] = await db.query(
            'DELETE FROM product_raw_materials WHERE product_id = ? AND raw_material_id = ?',
            [productId, rawMaterialId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Associação não encontrada' });
        }
        
        res.json({ message: 'Associação removida com sucesso' });
    } catch (error) {
        console.error('Erro em removeRawMaterialAssociation:', error);
        res.status(500).json({ message: 'Erro ao remover associação', error: error.message });
    }
};

module.exports = {
    associateRawMaterial,
    getProductRawMaterials,
    updateQuantityNeeded,
    removeRawMaterialAssociation
};