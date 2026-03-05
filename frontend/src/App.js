import React, { useState } from 'react';
import ProductList from './components/ProductList';
import RawMaterialList from './components/RawMaterialList';
import ProductMaterialAssociation from './components/ProductMaterialAssociation';
import ProductionSuggestion from './components/ProductionSuggestion';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

function App() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="App">
      <nav className="navbar navbar-dark">
        <div className="container">
          <span className="navbar-brand">
            Inventory Control System
          </span>
          <span className="text-white-50">
            v1.0.0
          </span>
        </div>
      </nav>

      <div className="container">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Produtos
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'materials' ? 'active' : ''}`}
              onClick={() => setActiveTab('materials')}
            >
              Matérias-Primas
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'association' ? 'active' : ''}`}
              onClick={() => setActiveTab('association')}
            >
              Associar
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'production' ? 'active' : ''}`}
              onClick={() => setActiveTab('production')}
            >
              Produção
            </button>
          </li>
        </ul>

        <div className="mt-4">
          {activeTab === 'products' && <ProductList />}
          {activeTab === 'materials' && <RawMaterialList />}
          {activeTab === 'association' && <ProductMaterialAssociation />}
          {activeTab === 'production' && <ProductionSuggestion />}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-5 py-4 bg-dark text-white-50">
        <div className="container text-center">
          <small>
            © 2026 Inventory Control System - Todos os direitos reservados
          </small>
        </div>
      </footer>
    </div>
  );
}

export default App;