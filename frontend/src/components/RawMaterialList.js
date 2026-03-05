import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaBoxes } from 'react-icons/fa';
import { MdInventory } from 'react-icons/md';

function RawMaterialList() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    stock_quantity: ''
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/raw-materials');
      const materialsWithNumber = response.data.map(material => ({
        ...material,
        stock_quantity: Number(material.stock_quantity)
      }));
      setMaterials(materialsWithNumber);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar matérias-primas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'stock_quantity' ? parseInt(value) || 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const materialData = {
        ...formData,
        stock_quantity: parseInt(formData.stock_quantity) || 0
      };

      if (editingMaterial) {
        await api.put(`/raw-materials/${editingMaterial.id}`, materialData);
      } else {
        await api.post('/raw-materials', materialData);
      }
      
      setFormData({ name: '', stock_quantity: '' });
      setEditingMaterial(null);
      setShowForm(false);
      fetchMaterials();
    } catch (err) {
      setError('Erro ao salvar matéria-prima: ' + err.message);
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      stock_quantity: material.stock_quantity
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta matéria-prima?')) {
      try {
        await api.delete(`/raw-materials/${id}`);
        fetchMaterials();
      } catch (err) {
        setError('Erro ao deletar matéria-prima: ' + err.message);
      }
    }
  };

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && materials.length === 0) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-3 text-muted">Carregando matérias-primas...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FaBoxes className="me-2" />
          Matérias-Primas
        </h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingMaterial(null);
            setFormData({ name: '', stock_quantity: '' });
          }}
        >
          {showForm ? <FaTimes className="me-2" /> : <FaPlus className="me-2" />}
          {showForm ? 'Cancelar' : 'Nova Matéria-Prima'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar matérias-primas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            {editingMaterial ? 'Editar Matéria-Prima' : 'Nova Matéria-Prima'}
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nome</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Madeira"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Quantidade em Estoque</label>
                  <div className="input-group">
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      placeholder="0"
                      required
                    />
                    <span className="input-group-text">unidades</span>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-success">
                {editingMaterial ? 'Atualizar' : 'Salvar'}
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
                  <th>Estoque</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map(material => (
                  <tr key={material.id}>
                    <td><span className="badge bg-secondary">#{material.id}</span></td>
                    <td><strong>{material.name}</strong></td>
                    <td>
                      <span className="badge bg-info">
                        <MdInventory className="me-1" />
                        {material.stock_quantity} unidades
                      </span>
                    </td>
                    <td>
                      {material.stock_quantity > 50 ? (
                        <span className="badge bg-success">Alto</span>
                      ) : material.stock_quantity > 20 ? (
                        <span className="badge bg-warning">Médio</span>
                      ) : material.stock_quantity > 0 ? (
                        <span className="badge bg-danger">Baixo</span>
                      ) : (
                        <span className="badge bg-dark">Esgotado</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(material)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(material.id)}
                        title="Deletar"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredMaterials.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <p className="text-muted mb-0">Nenhuma matéria-prima encontrada</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              Total: {filteredMaterials.length} matéria(s)-prima(s)
            </small>
            <div>
              <span className="badge bg-success me-2">Alto</span>
              <span className="badge bg-warning me-2">Médio</span>
              <span className="badge bg-danger me-2">Baixo</span>
              <span className="badge bg-dark">Esgotado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RawMaterialList;