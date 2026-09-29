# ABM em Todo Lugar — Produção Zerada

Esta versão foi preparada sem dados de demonstração.

## Dados iniciais
- Usuários: 0
- Lojas: 0
- Produtos: 0
- Serviços: 0
- Anúncios: 0
- Banners: 0
- Notícias: 0
- Documentos: 0
- Conversas: 0
- Mensagens: 0
- Notificações: 0
- Favoritos: 0
- Categorias: 0

## Autenticação
O cadastro por e-mail cria um usuário real no armazenamento da aplicação.
Os botões Google, Apple e Facebook permanecem disponíveis na interface, mas não criam contas falsas: precisam ser conectados aos respectivos provedores OAuth.
O login por telefone também não cria contas fictícias; a validação real deve ser conectada ao serviço de SMS/WhatsApp.

## Migração da versão de demonstração
A aplicação usa `production-v1` como versão dos dados. Na primeira abertura desta versão, os dados locais da versão anterior são removidos para evitar que contas e exemplos de demonstração apareçam.
