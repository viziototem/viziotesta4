# ABM em Todo Lugar — Preview de visitante e autenticação

Implementado diretamente na aplicação existente.

## Preview de visitante
- Usuário não autenticado inicia uma prévia ao carregar a home.
- Limite de 20 segundos ou 50% da altura da página, o primeiro que ocorrer.
- O início da prévia é persistido em localStorage e não reinicia com refresh/navegação.
- Ao atingir o limite, a rolagem é bloqueada e abre o modal de acesso.
- Usuários autenticados ignoram completamente a prévia.
- Rotas/áreas de perfil, chat, lojista e administração exigem autenticação.
- O conteúdo público da home, lojas, busca e informações ABM continua disponível na prévia.

## Autenticação
- Login por e-mail e senha.
- Continuar com Google.
- Continuar com Apple.
- Continuar com Facebook.
- Acesso por telefone com código.
- Recuperação de senha.
- Cadastro gratuito de morador com nome, e-mail, telefone, unidade, senha e aceite dos termos.
- Após login/cadastro, o usuário volta para a experiência autenticada.

## Observação
Os botões sociais/telefone estão preparados na interface como fluxo de demonstração local. Para produção, devem ser ligados aos respectivos provedores OAuth/SMS/WhatsApp e ao backend de autenticação. A validação de permissões reais deve continuar no backend.
