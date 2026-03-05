const db = require('../config/database');

// GET /api/raw-materials - Listar todas as matérias-primas
const getAllRawMaterials = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM raw_materials ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Erro em getAllRawMaterials:', error);
        res.status(500).json({ message: 'Erro ao buscar matérias-primas', error: error.message });
    }
};

// GET /api/raw-materials/:id - Buscar matéria-prima por ID
const getRawMaterialById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM raw_materials WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Matéria-prima não encontrada' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Erro em getRawMaterialById:', error);
        res.status(500).json({ message: 'Erro ao buscar matéria-prima', error: error.message });
    }
};

// POST /api/raw-materials - Criar nova matéria-prima
const createRawMaterial = async (req, res) => {
    try {
        const { name, stock_quantity } = req.body;
        
        if (!name || stock_quantity === undefined) {
            return res.status(400).json({ message: 'Nome e quantidade são obrigatórios' });
        }
        
        const [result] = await db.query(
            'INSERT INTO raw_materials (name, stock_quantity) VALUES (?, ?)',
            [name, stock_quantity]
        );
        
        res.status(201).json({
            id: result.insertId,
            name,
            stock_quantity,
            message: 'Matéria-prima criada com sucesso'
        });
    } catch (error) {
        console.error('Erro em createRawMaterial:', error);
        res.status(500).json({ message: 'Erro ao criar matéria-prima', error: error.message });
    }
};

// PUT /api/raw-materials/:id - Atualizar matéria-prima
const updateRawMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, stock_quantity } = req.body;
        
        const [result] = await db.query(
            'UPDATE raw_materials SET name = ?, stock_quantity = ? WHERE id = ?',
            [name, stock_quantity, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Matéria-prima não encontrada' });
        }
        
        res.json({ message: 'Matéria-prima atualizada com sucesso' });
    } catch (error) {
        console.error('Erro em updateRawMaterial:', error);
        res.status(500).json({ message: 'Erro ao atualizar matéria-prima', error: error.message });
    }
};

// DELETE /api/raw-materials/:id - Deletar matéria-prima
const deleteRawMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.query('DELETE FROM raw_materials WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Matéria-prima não encontrada' });
        }
        
        res.json({ message: 'Matéria-prima deletada com sucesso' });
    } catch (error) {
        console.error('Erro em deleteRawMaterial:', error);
        res.status(500).json({ message: 'Erro ao deletar matéria-prima', error: error.message });
    }
};

module.exports = {
    getAllRawMaterials,
    getRawMaterialById,
    createRawMaterial,
    updateRawMaterial,
    deleteRawMaterial
};