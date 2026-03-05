const db = require('../config/database');

// GET /api/production/suggestion - Sugestão de produção
const getProductionSuggestion = async (req, res) => {
    try {
        // Buscar todos os produtos com suas matérias-primas
        const [products] = await db.query(`
            SELECT 
                p.id,
                p.name,
                p.value,
                prm.raw_material_id,
                prm.quantity_needed,
                rm.stock_quantity
            FROM products p
            JOIN product_raw_materials prm ON p.id = prm.product_id
            JOIN raw_materials rm ON prm.raw_material_id = rm.id
            ORDER BY p.value DESC
        `);

        // Agrupar por produto
        const productMap = new Map();
        products.forEach(row => {
            if (!productMap.has(row.id)) {
                productMap.set(row.id, {
                    id: row.id,
                    name: row.name,
                    value: row.value,
                    materials: []
                });
            }
            productMap.get(row.id).materials.push({
                raw_material_id: row.raw_material_id,
                quantity_needed: row.quantity_needed,
                stock_quantity: row.stock_quantity
            });
        });

        // Criar um mapa de estoque disponível
        const [rawMaterials] = await db.query('SELECT id, stock_quantity FROM raw_materials');
        let availableStock = {};
        rawMaterials.forEach(rm => {
            availableStock[rm.id] = rm.stock_quantity;
        });

        // Calcular sugestões
        let suggestions = [];
        let remainingStock = { ...availableStock };

        for (let [_, product] of productMap) {
            // Verificar quantas unidades podemos produzir
            let maxUnits = Infinity;
            
            for (let material of product.materials) {
                const available = remainingStock[material.raw_material_id] || 0;
                const possibleUnits = Math.floor(available / material.quantity_needed);
                maxUnits = Math.min(maxUnits, possibleUnits);
            }

            if (maxUnits > 0 && maxUnits !== Infinity) {
                suggestions.push({
                    product_id: product.id,
                    product_name: product.name,
                    product_value: product.value,
                    possible_quantity: maxUnits,
                    total_value: product.value * maxUnits
                });

                // Consumir do estoque
                for (let material of product.materials) {
                    remainingStock[material.raw_material_id] -= maxUnits * material.quantity_needed;
                }
            }
        }

        // Calcular total geral
        const grandTotal = suggestions.reduce((sum, item) => sum + item.total_value, 0);

        res.json({
            suggestions,
            grand_total: grandTotal,
            remaining_stock: remainingStock
        });

    } catch (error) {
        console.error('Erro em getProductionSuggestion:', error);
        res.status(500).json({ message: 'Erro ao calcular sugestão de produção', error: error.message });
    }
};

module.exports = {
    getProductionSuggestion
};