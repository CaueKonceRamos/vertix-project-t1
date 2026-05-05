# ⚡ Voltix - IoT Visual Editor

Um editor visual moderno para IoT, permitindo criar projetos com objetos 3D e componentes de circuito. Inspirado em ferramentas profissionais como Tinkercad, com interface intuitiva de arrastar e soltar.

## ✨ Funcionalidades

### 🎯 Core
- **Editor Canvas**: Área de trabalho com grid e drag-and-drop
- **Biblioteca de Objetos**: Formas 3D (cubo, esfera, cilindro, cone) e componentes de circuito (LED, resistor, bateria, Arduino, botão)
- **Sistema de Projetos**: Criar, salvar e gerenciar projetos
- **Simulação Básica**: LEDs acendem quando conectados à bateria

### 🚀 Funcionalidades Adicionais
- Auto-save automático (a cada 5 segundos)
- Seleção e manipulação de objetos (mover, rotacionar, deletar)
- Interface responsiva e intuitiva
- Salvamento local (localStorage)

## 🛠️ Tecnologias

- **React 18** - Interface do usuário
- **Vite** - Build tool e dev server
- **CSS Modules** - Estilização
- **UUID** - Geração de IDs únicos
- **LocalStorage** - Persistência de dados

## 🚀 Como Usar

### Instalação

```bash
# Clone ou baixe o projeto
cd tinkerc

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Uso Básico

1. **Login**: Digite seu nome para entrar
2. **Criar Projeto**: Clique em "Novo Projeto" e dê um nome
3. **Adicionar Objetos**: Arraste itens da biblioteca para o canvas
4. **Manipular**: Clique em objetos para selecionar, use os controles para rotacionar/deletar
5. **Simular**: Clique em "Simular" para ver LEDs acenderem quando conectados à bateria
6. **Salvar**: O projeto é salvo automaticamente

## 📁 Estrutura do Projeto

```
tinkerc/
├── src/
│   ├── components/          # Componentes React
│   │   ├── LoginScreen.jsx
│   │   ├── ProjectsScreen.jsx
│   │   ├── Editor.jsx
│   │   ├── Canvas.jsx
│   │   └── ...
│   ├── context/             # Context API para estado global
│   │   └── ProjectContext.jsx
│   ├── styles/              # Arquivos CSS
│   └── main.jsx             # Ponto de entrada
├── package.json
├── vite.config.js
└── index.html
```

## 🎮 Como Funciona

### Estado Global
O `ProjectContext` gerencia todo o estado da aplicação:
- Usuários e projetos
- Objetos no canvas
- Conexões entre componentes
- Modo de simulação

### Simulação
Atualmente implementada uma simulação simples:
- LEDs acendem quando conectados a uma bateria
- Expansível para comportamentos mais complexos

### Salvamento
- Auto-save a cada 5 segundos
- Dados salvos em localStorage como JSON
- Estrutura preparada para backend futuro

## 🔄 Próximas Funcionalidades

- Sistema de conexões visuais entre componentes
- Mais tipos de objetos e componentes
- Simulação mais avançada (Arduino code execution)
- Exportar projetos (JSON, imagem)
- Compartilhar projetos
- Histórico de versões (undo/redo)

## 🎖️ Créditos e Copyright

Este projeto foi desenvolvido como uma ferramenta educacional e profissional para prototipagem visual de projetos IoT.

**© 2026 Voltix - IoT Visual Editor**

**Desenvolvido por:**
- ___________________
- ___________________
- ___________________

## 🤝 Contribuição

Este é um projeto de demonstração. Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é para fins educacionais e de demonstração.

---

**Criado com ⚡ para revolucionar a prototipagem visual de projetos IoT**