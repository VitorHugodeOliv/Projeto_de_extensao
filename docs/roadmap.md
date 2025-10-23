# 🗂️ Projeto: Arquivo Digital de Memória Cultural  
---

## 🧱 **Fase 1 – Estabilidade e Segurança (prioridade alta)**

| Tarefa | Status | Descrição |
|--------|:------:|-----------|
| 🔐 Criptografia e autenticação JWT revisada | ✅ | Confirmar uso do `bcrypt` e validade dos tokens. |
| 🕒 Refresh Token | ✅ | Implementar sistema de renovação automática do JWT. |
| 🧩 Middleware de erros globais | ⬜ | Criar interceptador de erros com mensagens padronizadas em JSON. |
| 🛡️ Rate limiting | ⬜ | Adicionar `Flask-Limiter` nas rotas sensíveis. |
| ✉️ Envio de e-mails | ⬜ | Implementar `Flask-Mail` para redefinição de senha e notificações. |

---

## ⚙️ **Fase 2 – Funcionalidade do Administrador**

| Tarefa | Status | Descrição |
|--------|:------:|-----------|
| 🧾 LogsAdmin com ON DELETE SET NULL | ✅ | Mantém histórico após exclusão de histórias. |
| 👁️ Visualização de logs no painel admin | ⬜ | Criar rota `/admin/logs` e listagem no front. |
| 🗃️ Paginação e filtros no painel admin | ⬜ | Filtro por “Em análise”, “Aprovadas”, “Rejeitadas”. |
| 📝 Motivo da rejeição | ⬜ | Admin pode adicionar comentário explicando a decisão. |
| 📊 Painel estatístico | ⬜ | Gráficos com contagem de histórias por categoria/status. |

---

## 🎨 **Fase 3 – Experiência do Usuário (Frontend)**

| Tarefa | Status | Descrição |
|--------|:------:|-----------|
| 🧭 Menu dinâmico por tipo de usuário | ⬜ | Mostrar/ocultar rotas conforme tipo (`admin`, `comum`). |
| 🔒 Proteção de rotas via token | ✅ | Redireciona se token expirado ou inválido. |
| 📥 Barra de progresso no upload | ⬜ | Mostrar andamento de upload (axios progress). |
| 💬 Alertas personalizados | ⬜ | Substituir `alert()` por `react-toastify` ou `SweetAlert2`. |
| 🖼️ Modal de visualização | ⬜ | Ver detalhes da história e mídias em popup. |
| 🎧 Galeria pública | ⬜ | Exibir histórias aprovadas com mídia no site público. |

---

## 🧩 **Fase 4 – Estrutura e Organização de Código**

| Tarefa | Status | Descrição |
|--------|:------:|-----------|
| 📦 Separar chamadas Axios em `api.ts` | ⬜ | Centralizar endpoints. |
| 🌍 Context API / Zustand | ⬜ | Gerenciar token e dados globalmente. |
| 🎨 Migrar CSS para módulos | ⬜ | Isolar estilos e evitar conflitos. |
| 🧪 Testes com Pytest (back) e RTL (front) | ✅ | Já iniciados; expandir cobertura. |
| 🧰 Scripts de inicialização (`setup.sh`) | ⬜ | Criar scripts para subir banco + servidor com 1 comando. |

---

## ☁️ **Fase 5 – Infraestrutura e Deploy**

| Tarefa | Status | Descrição |
|--------|:------:|-----------|
| 🐳 Docker Compose | ⬜ | Subir Flask + MySQL + Frontend via contêineres. |
| 🔄 CI/CD (GitHub Actions) | ⬜ | Rodar testes automáticos a cada commit/pull request. |
| 💾 Backup automático | ⬜ | Exportação diária do banco (`mysqldump`). |
| ☁️ Armazenamento em nuvem | ⬜ | Substituir `uploads/` por S3 ou GCP Storage. |

---

## 📈 **Fase 6 – Curadoria e Expansão**

| Tarefa | Status | Descrição |
|--------|:------:|-----------|
| 💬 Sistema de comentários entre admins | ⬜ | Curadoria colaborativa antes da aprovação final. |
| 🕓 Histórico de revisões | ⬜ | Guardar versões antigas das histórias. |
| 🏆 Destaques culturais | ⬜ | Campo “destaque” para exibir histórias na página inicial. |
| 📤 Exportar histórias aprovadas | ⬜ | Em JSON/CSV para relatórios culturais. |

---

## 📊 **Resumo de Progresso**

| Fase | Percentual estimado |
|------|---------------------|
| 🧱 Estabilidade | 60% |
| ⚙️ Funcionalidade Admin | 40% |
| 🎨 UX e Frontend | 30% |
| 🧩 Estrutura | 50% |
| ☁️ Infraestrutura | 10% |
| 📈 Expansão | 0% |

---

## 💡 passos imediatos

1. **Implementar o campo “motivo da rejeição”** no backend e frontend.  
2. Criar rota `/admin/logs` e visualização de histórico no painel.  
3. Adicionar **barra de progresso de upload** no front (melhora UX).  
4. Adotar **Context API** pra gerenciar o token globalmente.  
5. Iniciar setup de **Docker Compose** pra rodar tudo com 1 comando.  
