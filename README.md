#  Inventory Control System

Sistema completo para controle de estoque de matérias-primas e produtos, com sugestão inteligente de produção priorizando itens de maior valor.

##  Funcionalidades

- ✅ **CRUD de Produtos** - Cadastro, edição, listagem e exclusão
- ✅ **CRUD de Matérias-Primas** - Controle de estoque
- ✅ **Associação** - Vincular matérias-primas aos produtos com quantidades
- ✅ **Sugestão de Produção** - Algoritmo que prioriza produtos de maior valor
- ✅ **Interface Responsiva** - Funciona em desktop, tablet e mobile
- ✅ **Design Moderno** - Gradientes, animações e ícones

##  Tecnologias Utilizadas

### Front-end
- **React** - Biblioteca para interfaces
- **Bootstrap** - Estilização responsiva
- **React Icons** - Ícones modernos
- **Axios** - Requisições HTTP

### Back-end
- **Node.js** - Ambiente de execução
- **Express** - Framework web
- **MySQL** - Banco de dados
- **CORS** - Segurança de requisições

##  Como Executar o Projeto

### Pré-requisitos
- Node.js (v14 ou superior)
- MySQL (v8 ou superior)
- Git

## PASSO A PASSO
#### 1. Clone o repositório

git clone https://github.com/SEU-USUARIO/inventory-control-system.git
cd inventory-control-system

#### 2. Configure o Banco de Dados
Execute os scripts SQL abaixo no MySQL:

-- Cria o banco de dados
CREATE DATABASE inventory_control;
USE inventory_control;

-- Tabela de produtos
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de matérias-primas
CREATE TABLE raw_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de associação
CREATE TABLE product_raw_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    raw_material_id INT NOT NULL,
    quantity_needed INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_raw_material (product_id, raw_material_id)
);

#### 3. Configure o Back-end
bash
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Edite o arquivo .env com suas configurações do MySQL
.env.example (crie este arquivo):


PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=inventory_control

# Inicie o servidor
npm run dev
#### 4. Configure o Front-end
Abra um novo terminal e execute:

# Volte para a raiz do projeto
cd ..

# Instale as dependências
npm install

# Inicie o React
npm start

#### 5. Acesse a aplicação
Front-end: http://localhost:3001

Back-end API: http://localhost:3000/api/health

#### Dados para Teste
Para testar todas as funcionalidades, execute estes scripts SQL:

### 1. Inserir Matérias-Primas
INSERT INTO raw_materials (name, stock_quantity) VALUES
('Madeira', 100),
('Parafuso', 500),
('Tinta', 50),
('Tecido', 30),
('Plástico', 200);

### 2. Inserir Produtos
INSERT INTO products (name, value) VALUES
('Mesa de Escritório', 350.00),
('Cadeira Executiva', 150.00),
('Armário de Aço', 800.00),
('Cortina Blackout', 120.00),
('Estante Modular', 450.00);

### 3. Associar Matérias-Primas aos Produtos

-- Mesa (id=1)
INSERT INTO product_raw_materials (product_id, raw_material_id, quantity_needed) VALUES
(1, 1, 10),  -- 10 Madeiras
(1, 2, 20),  -- 20 Parafusos
(1, 3, 1);   -- 1 Tinta

-- Cadeira (id=2)
INSERT INTO product_raw_materials (product_id, raw_material_id, quantity_needed) VALUES
(2, 1, 5),   -- 5 Madeiras
(2, 2, 10);  -- 10 Parafusos

-- Armário (id=3)
INSERT INTO product_raw_materials (product_id, raw_material_id, quantity_needed) VALUES
(3, 1, 20),  -- 20 Madeiras
(3, 2, 30),  -- 30 Parafusos
(3, 3, 2);   -- 2 Tintas

-- Cortina (id=4)
INSERT INTO product_raw_materials (product_id, raw_material_id, quantity_needed) VALUES
(4, 4, 5);   -- 5 Tecidos

-- Estante (id=5)
INSERT INTO product_raw_materials (product_id, raw_material_id, quantity_needed) VALUES
(5, 1, 15),  -- 15 Madeiras
(5, 2, 25),  -- 25 Parafusos
(5, 5, 10);  -- 10 Plásticos

### 4. Testar a Sugestão de Produção
Com esses dados, o sistema vai sugerir:

Armário (R$ 800) - 2 unidades
Estante (R$ 450) - 3 unidades
Mesa (R$ 350) - 2 unidades
Cadeira (R$ 150) - 5 unidades
Cortina (R$ 120) - 6 unidades
Valor total estimado: R$ 5.470,00

### Screenshots

Tela de Produtos
(produto.png)

Tela de Matérias-Primas
(MateriaPrima.png)

Tela de Associação
(associação.png)

Tela de Sugestão de Produção
(producao.png)

### Como o Algoritmo Funciona
O sistema usa um algoritmo de priorização que:

Lista todos os produtos com suas matérias-primas necessárias
Ordena por maior valor (do mais caro para o mais barato)
Calcula quantos de cada podem ser produzidos com o estoque atual
Consome o estoque virtualmente para os produtos mais caros primeiro
Retorna a sugestão final maximizando o valor total da produção

Exemplo Prático:
Estoque: 50 Madeiras, 100 Parafusos, 10 Tintas
Armário (R$ 800) precisa: 20 Madeiras, 30 Parafusos, 2 Tintas → 2 unidades
Mesa (R$ 350) precisa: 10 Madeiras, 20 Parafusos, 1 Tinta → 3 unidades
Total: R$ 2.650,00


