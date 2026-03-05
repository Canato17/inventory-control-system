import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ProductMaterialAssociation() {
  const [products, setProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para o formulário de associação
  const [formData, setFormData] = useState({
    raw_material_id: '',
    quantity_needed: ''
  });

  // Carregar produtos e matérias-primas ao iniciar
  useEffect(() => {
    fetchData();
  }, []);

  // Quando selecionar um produto, carregar suas associações
  useEffect(() => {
    if (selectedProduct) {
      fetchAssociations(selectedProduct.id);
    } else {
      setAssociations([]);
    }
  }, [selectedProduct]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Buscar produtos e matérias-primas em paralelo
      const [productsRes, materialsRes] = await Promise.all([
        api.get('/products'),
        api.get('/raw-materials')
      ]);

      // Converter valores para número
      const productsWithNumber = productsRes.data.map(p => ({
        ...p,
        value: Number(p.value)
      }));

      const materialsWithNumber = materialsRes.data.map(m => ({
        ...m,
        stock_quantity: Number(m.stock_quantity)
      }));

      setProducts(productsWithNumber);
      setRawMaterials(materialsWithNumber);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociations = async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/raw-materials`);
      setAssociations(response.data);
    } catch (err) {
      setError('Erro ao carregar associações: ' + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity_needed' ? parseInt(value) || 0 : value
    });
  };

  const handleAssociate = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError('Selecione um produto primeiro');
      return;
    }

    try {
      await api.post(`/products/${selectedProduct.id}/raw-materials`, {
        raw_material_id: parseInt(formData.raw_material_id),
        quantity_needed: parseInt(formData.quantity_needed)
      });

      // Limpar formulário e recarregar associações
      setFormData({ raw_material_id: '', quantity_needed: '' });
      fetchAssociations(selectedProduct.id);
      setError(null);
    } catch (err) {
      setError('Erro ao associar matéria-prima: ' + err.message);
    }
  };

  const handleRemoveAssociation = async (rawMaterialId) => {
    if (!selectedProduct) return;
    
    if (window.confirm('Remover esta matéria-prima do produto?')) {
      try {
        await api.delete(`/products/${selectedProduct.id}/raw-materials/${rawMaterialId}`);
        fetchAssociations(selectedProduct.id);
      } catch (err) {
        setError('Erro ao remover associação: ' + err.message);
      }
    }
  };

  const handleUpdateQuantity = async (rawMaterialId, newQuantity) => {
    try {
      await api.put(`/products/${selectedProduct.id}/raw-materials/${rawMaterialId}`, {
        quantity_needed: parseInt(newQuantity)
      });
      fetchAssociations(selectedProduct.id);
    } catch (err) {
      setError('Erro ao atualizar quantidade: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Carregando...</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Associação de Matérias-Primas</h2>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <div className="row">
        {/* Coluna da esquerda - Seleção de Produto */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Selecione um Produto</h5>
            </div>
            <div className="card-body">
              <select 
                className="form-select"
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const product = products.find(p => p.id === parseInt(e.target.value));
                  setSelectedProduct(product);
                }}
              >
                <option value="">Escolha um produto...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - R$ {product.value.toFixed(2)}
                  </option>
                ))}
              </select>

              {selectedProduct && (
                <div className="mt-3">
                  <strong>Produto Selecionado:</strong>
                  <p className="mb-0">{selectedProduct.name}</p>
                  <small className="text-muted">
                    Valor: R$ {selectedProduct.value.toFixed(2)}
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna do meio - Formulário de Associação */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Adicionar Matéria-Prima</h5>
            </div>
            <div className="card-body">
              {!selectedProduct ? (
                <p className="text-muted">Selecione um produto primeiro</p>
              ) : (
                <form onSubmit={handleAssociate}>
                  <div className="mb-3">
                    <label className="form-label">Matéria-Prima</label>
                    <select
                      className="form-select"
                      name="raw_material_id"
                      value={formData.raw_material_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione...</option>
                      {rawMaterials.map(material => (
                        <option key={material.id} value={material.id}>
                          {material.name} (Estoque: {material.stock_quantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Quantidade Necessária</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantity_needed"
                      min="1"
                      value={formData.quantity_needed}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-success w-100">
                    Associar ao Produto
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Coluna da direita - Lista de Associações */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Matérias-Primas do Produto</h5>
            </div>
            <div className="card-body">
              {!selectedProduct ? (
                <p className="text-muted">Selecione um produto para ver as matérias-primas</p>
              ) : associations.length === 0 ? (
                <p className="text-muted">Nenhuma matéria-prima associada</p>
              ) : (
                <ul className="list-group">
                  {associations.map(assoc => (
                    <li key={assoc.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{assoc.name}</strong>
                        <br />
                        <small>Quantidade: {assoc.quantity_needed} unidades</small>
                        <br />
                        <small className="text-muted">
                          Estoque disponível: {assoc.stock_quantity}
                        </small>
                      </div>
                      <div>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => {
                            const newQuantity = prompt('Nova quantidade:', assoc.quantity_needed);
                            if (newQuantity && !isNaN(newQuantity) && parseInt(newQuantity) > 0) {
                              handleUpdateQuantity(assoc.id, newQuantity);
                            }
                          }}
                          title="Editar quantidade"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveAssociation(assoc.id)}
                          title="Remover"
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela resumo */}
      {selectedProduct && associations.length > 0 && (
        <div className="card mt-4">
          <div className="card-header bg-secondary text-white">
            <h5 className="mb-0">Resumo do Produto: {selectedProduct.name}</h5>
          </div>
          <div className="card-body">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Matéria-Prima</th>
                  <th>Quantidade Necessária</th>
                  <th>Estoque Atual</th>
                  <th>Produção Possível</th>
                </tr>
              </thead>
              <tbody>
                {associations.map(assoc => {
                  const possibleUnits = Math.floor(assoc.stock_quantity / assoc.quantity_needed);
                  return (
                    <tr key={assoc.id}>
                      <td>{assoc.name}</td>
                      <td>{assoc.quantity_needed}</td>
                      <td>{assoc.stock_quantity}</td>
                      <td>
                        <span className={`badge ${possibleUnits > 0 ? 'bg-success' : 'bg-danger'}`}>
                          {possibleUnits} unidades
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Calcular produção máxima baseada no gargalo */}
            {associations.length > 0 && (
              <div className="alert alert-info mt-3">
                <strong>Produção máxima possível:</strong>{' '}
                {Math.min(...associations.map(a => 
                  Math.floor(a.stock_quantity / a.quantity_needed)
                ))} unidades de {selectedProduct.name}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductMaterialAssociation;