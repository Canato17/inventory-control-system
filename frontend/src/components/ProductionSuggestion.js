import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ProductionSuggestion() {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSuggestion = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/production/suggestion');
      
      // converter todos dos valores para números
      const data = response.data;
      
      // Converter suggestions
      data.suggestions = data.suggestions.map(item => ({
        ...item,
        product_value: Number(item.product_value),
        total_value: Number(item.total_value)
      }));
      
      // Converter grand_total
      data.grand_total = Number(data.grand_total);
      
      setSuggestion(data);
      setError(null);
    } catch (err) {
      setError('Erro ao calcular sugestão de produção: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuggestion();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-2">Calculando melhor sugestão de produção...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h5>Erro!</h5>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchSuggestion}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!suggestion || suggestion.suggestions.length === 0) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h5>Não é possível produzir nada no momento!</h5>
          <p>Estoque insuficiente para produzir qualquer produto.</p>
          <button className="btn btn-primary" onClick={fetchSuggestion}>
            Atualizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Cabeçalho com total */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-0">Sugestão de Produção</h4>
                  <small>Priorizando produtos de maior valor</small>
                </div>
                <div className="text-end">
                  <h2 className="mb-0">R$ {suggestion.grand_total.toFixed(2)}</h2>
                  <small>Valor total da produção</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de produção sugerida */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Produtos que podem ser produzidos</h5>
              <button 
                className="btn btn-light btn-sm" 
                onClick={fetchSuggestion}
                disabled={refreshing}
              >
                {refreshing ? 'Atualizando...' : '↻ Atualizar'}
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Produto</th>
                      <th>Valor Unitário</th>
                      <th>Quantidade</th>
                      <th>Valor Total</th>
                      <th>% do Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestion.suggestions.map(item => {
                      const percentage = (item.total_value / suggestion.grand_total * 100).toFixed(1);
                      return (
                        <tr key={item.product_id}>
                          <td>
                            <strong>{item.product_name}</strong>
                          </td>
                          <td>R$ {item.product_value.toFixed(2)}</td>
                          <td>
                            <span className="badge bg-info">
                              {item.possible_quantity} unidades
                            </span>
                          </td>
                          <td>
                            <strong>R$ {item.total_value.toFixed(2)}</strong>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress flex-grow-1" style={{ height: '8px' }}>
                                <div 
                                  className="progress-bar bg-success" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="ms-2 small">{percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="table-secondary">
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                      <td><strong>R$ {suggestion.grand_total.toFixed(2)}</strong></td>
                      <td>100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Análise de Estoque */}
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Estoque Restante</h5>
            </div>
            <div className="card-body">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Matéria-Prima</th>
                    <th>Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(suggestion.remaining_stock).map(([id, quantity]) => {
                    const materialName = getMaterialName(id);
                    const qty = Number(quantity);
                    return (
                      <tr key={id}>
                        <td>{materialName}</td>
                        <td>
                          <span className={`badge ${qty > 0 ? 'bg-success' : 'bg-danger'}`}>
                            {qty} unidades
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-warning">
              <h5 className="mb-0">Resumo da Produção</h5>
            </div>
            <div className="card-body">
              <ul className="list-group">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Total de produtos diferentes
                  <span className="badge bg-primary rounded-pill">
                    {suggestion.suggestions.length}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Total de unidades produzidas
                  <span className="badge bg-primary rounded-pill">
                    {suggestion.suggestions.reduce((sum, item) => sum + item.possible_quantity, 0)}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Média de valor por produto
                  <span className="badge bg-primary rounded-pill">
                    R$ {(suggestion.grand_total / suggestion.suggestions.reduce((sum, item) => sum + item.possible_quantity, 0)).toFixed(2)}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Produto mais caro sugerido
                  <span className="badge bg-primary rounded-pill">
                    {suggestion.suggestions.length > 0 ? 
                      `R$ ${Math.max(...suggestion.suggestions.map(s => s.product_value)).toFixed(2)}` : 
                      'N/A'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Explicação da priorização */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body">
              <h6>Como funciona a priorização:</h6>
              <p className="mb-0 small">
                O sistema prioriza a produção dos produtos de <strong>maior valor</strong> primeiro, 
                pois uma mesma matéria-prima pode ser usada em múltiplos produtos. 
                A sugestão apresentada maximiza o valor total da produção considerando o estoque disponível.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Função auxiliar para buscar nome da matéria-prima
function getMaterialName(id) {
  const materials = {
    '1': 'Madeira',
    '2': 'Parafuso',
    '3': 'Tinta',
    '4': 'Tecido',
    '5': 'Plástico'
  };
  return materials[id] || `Material #${id}`;
}

export default ProductionSuggestion;