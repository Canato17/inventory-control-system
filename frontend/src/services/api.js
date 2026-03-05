import axios from 'axios';

// Configuração base da API
// IMPORTANTE: Sua API está rodando em http://localhost:3000
const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

export default api;