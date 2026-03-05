const mysql = require('mysql2');
require('dotenv').config();

// Configuração da conexão com MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'inventory_control',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Converter para Promise para usar async/await
const promisePool = pool.promise();

// Testar conexão
const testConnection = async () => {
    try {
        await promisePool.query('SELECT 1');
        console.log('✅ Banco de dados conectado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao conectar ao banco de dados:', error.message);
    }
};

testConnection();

module.exports = promisePool;