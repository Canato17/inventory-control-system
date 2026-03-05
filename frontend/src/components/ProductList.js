import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaBox } from 'react-icons/fa';
import { MdAttachMoney } from 'react-icons/md';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    value: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      const productsWithNumberValue = response.data.map(product => ({
        ...product,
        value: Number(product.value)
      }));
      setProducts(productsWithNumberValue);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar produtos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'value' ? parseFloat(value) || 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        value: parseFloat(formData.value) || 0
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productData);
      } else {
        await api.post('/products', productData);
      }
      
      setFormData({ name: '', value: '' });
      setEditingProduct(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setError('Erro ao salvar produto: ' + err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      value: product.value
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este produto?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        setError('Erro ao deletar produto: ' + err.message);
      }
    }
  };

  // Filtrar produtos pela busca
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && products.length === 0) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-3 text-muted">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FaBox className="me-2" />
          Produtos
        </h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingProduct(null);
            setFormData({ name: '', value: '' });
          }}
        >
          {showForm ? <FaTimes className="me-2" /> : <FaPlus className="me-2" />}
          {showForm ? 'Cancelar' : 'Novo Produto'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Barra de pesquisa */}
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <div className="card mb-4 animate__animated animate__fadeIn">
          <div className="card-header">
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nome do Produto</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Mesa de Escritório"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Valor (R$)</label>
                  <div className="input-group">
                    <span className="input-group-text">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-success">
                {editingProduct ? 'Atualizar Produto' : 'Salvar Produto'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td><span className="badge bg-secondary">#{product.id}</span></td>
                    <td><strong>{product.name}</strong></td>
                    <td>
                      <span className="badge bg-success">
                        <MdAttachMoney className="me-1" />
                        {product.value.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(product)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(product.id)}
                        title="Deletar"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <p className="text-muted mb-0">Nenhum produto encontrado</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Rodapé com contador */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              Total: {filteredProducts.length} produto(s)
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductList;