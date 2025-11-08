# 🎭 Arquivo Digital de Memória Cultural  
> Preservando histórias, conectando gerações 🌾

<p align="center">
  <img src="https://i.imgur.com/BxvDNye.png" alt="Banner Arquivo Digital de Memória Cultural" width="800"/>
</p>

<p align="center">
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white" /></a>
  <a href="https://flask.palletsprojects.com/"><img src="https://img.shields.io/badge/Flask-Framework-000000?logo=flask&logoColor=white" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Vite-3178C6?logo=typescript&logoColor=white" /></a>
  <a href="https://www.mysql.com/"><img src="https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/Licença-MIT-green.svg" /></a>
  <img src="https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow" />
</p>

---

## 🌍 Visão Geral
O **Arquivo Digital de Memória Cultural** é uma plataforma colaborativa onde artistas e agentes culturais podem **compartilhar histórias multimídia** (textos, fotos, vídeos e áudios) sobre a memória e a identidade de suas comunidades.

O sistema conta com uma **curadoria administrativa**, responsável por revisar, aprovar e organizar as contribuições no acervo digital.

> 💡 Desenvolvido como projeto de extensão em Engenharia de Software — unindo cultura, arte e tecnologia.

---

## 🧱 Arquitetura do Sistema

### 🐍 **Backend – Flask + MySQL**
- API REST com autenticação **JWT (Access e Refresh Tokens)**.  
- Confirmação de e-mail e recuperação de senha via **Flask-Mail**.  
- Controle de taxa (**Rate Limiter**) e logs automáticos.  
- Banco **MySQL**, criado e populado pelo script `init_db.py`.

### ⚛️ **Frontend – React + TypeScript**
- SPA com **React Router v7** e consumo da API via **Axios**.  
- Interface moderna com **Bootstrap 5** e **Toastify**.  
- Painel administrativo com **gráficos (Recharts)** e filtros dinâmicos.  
- Upload de mídias (imagens, vídeos e áudios) com validação de tamanho e formato.

---

## 🚀 Funcionalidades

### 🔐 **Autenticação e Segurança**
- Cadastro com senha criptografada (`bcrypt`).  
- Confirmação de e-mail obrigatória antes do primeiro login.  
- Recuperação de senha com link temporário.  
- Proteção contra múltiplas requisições (Rate Limiter).

### 📖 **Histórias e Memórias**
- CRUD completo de histórias, com anexos multimídia.  
- Listagem pública e filtrável por categoria.  
- Modal de visualização interativo.

### 🧠 **Painel Administrativo**
- Aprovação e rejeição com motivo obrigatório.  
- Dashboard com gráficos e logs de ação.  
- Curadoria de comentários e estatísticas de uso.

### 🎨 **Experiência do Usuário**
- SPA segura com menu dinâmico conforme o tipo de usuário.  
- Interface fluida, responsiva e acessível.  
- Notificações de status e feedback visual.

---

## 🗂️ Estrutura de Diretórios
```
Projeto_de_extensao/
├── README.md
├── docs/
│   └── roadmap.md
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── uploads/
│   └── logs/
└── frontend/
    ├── src/
    ├── public/
    └── vite.config.ts
```

---

## ⚙️ Como Executar

### 🐍 **Backend (Flask + MySQL)**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate  # Windows PowerShell

pip install -r requirements.txt

# Configurar .env
SECRET_KEY=chave_segura
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=senha123
DB_NAME=sistema_login
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=seuemail@gmail.com
MAIL_PASSWORD=sua_senha_de_app
MAIL_DEFAULT_SENDER_NAME=Arquivo Cultural

python init_db.py
python app.py
```
➡️ Servidor: `http://localhost:5000`

---

### ⚛️ **Frontend (React + Vite)**
```bash
cd frontend
npm install
npm run dev
```
➡️ Aplicação: `http://localhost:5173`

> Ajuste o endpoint da API em `frontend/src/apis/apiAxios.ts` caso use outra porta.

---

## 🧪 Testes

### 🔹 Backend
```bash
pytest
```

### 🔹 Frontend
```bash
npm run test
```

> Testes configurados com **Pytest**, **Vitest** e **React Testing Library**.

---

## 📦 Tecnologias Utilizadas
| Categoria | Tecnologias |
|------------|-------------|
| **Backend** | Flask · Flask-Mail · Flask-Limiter · MySQL · JWT · Bcrypt |
| **Frontend** | React · TypeScript · Vite · Axios · Bootstrap 5 · Recharts · Toastify |
| **Infra e Outras** | Python 3.11+ · Node 20+ · HTML5 · CSS3 |

---

## 🗃️ Outras Informações
- Logs rotacionados em `backend/logs/app.log` (limite de 5 MB).  
- Uploads salvos em `backend/uploads/`.  
- Roadmap com futuras etapas em `docs/roadmap.md` (Context API, CI/CD, Docker Compose etc).  

---

## 👨‍💻 Desenvolvido por  
**Vitor Hugo** – Ator, músico e engenheiro de software 🎭  
Projeto de Extensão em **Engenharia de Software – Anhanguera**  

> “A cultura é a memória viva de um povo — e a tecnologia é a ponte que a faz atravessar o tempo.” 💚  

<p align="center">
  <img src="https://img.shields.io/badge/Feito_com_💚_por-Vitor_Hugo-00a86b?style=for-the-badge" />
</p>

---

## 🪪 Licença
Distribuído sob a **Licença MIT**.  
Veja o arquivo `LICENSE` para mais detalhes.
