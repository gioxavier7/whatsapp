'use strict'

const numeroTelefone = '11987876567';
const listaContatos = document.getElementById('contacts-list');
const areaChat = document.getElementById('chat-area');
const campoBusca = document.getElementById('search-input');
let conversaAtual = null;

// Função auxiliar para criar elementos com propriedades
function criarElemento(tag, props = {}) {
    const elemento = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
        if (key === 'textContent') {
            elemento.textContent = value;
        } else if (key === 'className') {
            elemento.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                elemento.dataset[dataKey] = dataValue;
            });
        } else {
            elemento.setAttribute(key, value);
        }
    });
    return elemento;
}

// Carrega contatos e conversas da API
async function carregarContatosConversas() {
    try {
        // Criar elemento de loading de forma segura
        const loadingDiv = criarElemento('div', { className: 'loading', textContent: 'Carregando contatos...' });
        listaContatos.replaceChildren(loadingDiv);

        const resposta = await fetch(`http://localhost:8080/v1/whatsapp/conversas/${numeroTelefone}`);
        const conversas = await resposta.json();

        if (conversas.length === 0) {
            const semContatos = criarElemento('div', { className: 'loading', textContent: 'Nenhuma conversa encontrada' });
            listaContatos.replaceChildren(semContatos);
            return;
        }

        renderizarContatos(conversas);
        mostrarTelaInicial();
    } catch (erro) {
        console.error('Erro ao carregar conversas:', erro);
        const erroDiv = criarElemento('div', { className: 'loading', textContent: 'Erro ao carregar conversas' });
        listaContatos.replaceChildren(erroDiv);
    }
}

// Mostra a tela inicial padrão do WhatsApp
function mostrarTelaInicial() {
    areaChat.replaceChildren(); // Limpa o conteúdo

    const container = criarElemento('div', { className: 'container-chat' });
    
    const img = criarElemento('img', { 
        src: './img/whatsapp.png', 
        alt: 'whatsapp' 
    });
    
    const h2 = criarElemento('h2', { 
        textContent: 'Mantenha seu celular conectado' 
    });
    
    const p = criarElemento('p', { 
        textContent: 'Selecione um contato para ver as mensagens' 
    });
    
    container.append(img, h2, p);
    areaChat.appendChild(container);
    
    conversaAtual = null;
}

// Renderiza a lista de contatos
function renderizarContatos(conversas) {
    const fragmento = document.createDocumentFragment();

    conversas.forEach(conversa => {
        const ultimaMensagem = conversa.messages[conversa.messages.length - 1];

        const cartaoContato = criarElemento('div', { 
            className: 'contact-card',
            dataset: { nomeContato: conversa.name }
        });

        // Avatar do contato
        const avatar = criarElemento('div', { className: 'contact-avatar' });
        const imgAvatar = criarElemento('img', { 
            src: './img/user.jpg',
            alt: conversa.name
        });
        avatar.appendChild(imgAvatar);

        // Informações do contato
        const infoContato = criarElemento('div', { className: 'contact-info' });
        
        const nomeContato = criarElemento('div', { 
            className: 'contact-name',
            textContent: conversa.name
        });
        
        const mensagem = criarElemento('div', { 
            className: 'last-message',
            textContent: ultimaMensagem.content
        });
        
        const hora = criarElemento('div', { 
            className: 'last-message-time',
            textContent: ultimaMensagem.time
        });
        
        infoContato.append(nomeContato, mensagem, hora);
        cartaoContato.append(avatar, infoContato);

        cartaoContato.addEventListener('click', () => {
            document.querySelectorAll('.contact-card').forEach(cartao => {
                cartao.classList.remove('active');
            });
            cartaoContato.classList.add('active');
            carregarConversa(conversa);
        });

        fragmento.appendChild(cartaoContato);
    });

    listaContatos.replaceChildren(fragmento);
}

// Carrega a conversa de um contato específico
function carregarConversa(conversa) {
    conversaAtual = conversa;
    renderizarConversa(conversa);
}

// Renderiza a área de chat
function renderizarConversa(conversa) {
    const fragmento = document.createDocumentFragment();
    
    // Cabeçalho do chat
    const cabecalho = criarElemento('div', { className: 'chat-header' });
    
    const avatar = criarElemento('div', { className: 'chat-header-avatar' });
    const imgAvatar = criarElemento('img', { 
        src: './img/user.jpg',
        alt: conversa.name
    });
    avatar.appendChild(imgAvatar);
    
    const info = criarElemento('div', { className: 'chat-header-info' });
    
    const nome = criarElemento('div', { 
        className: 'chat-header-name',
        textContent: conversa.name
    });
    
    const descricao = criarElemento('div', { 
        className: 'chat-header-description',
        textContent: conversa.description
    });
    
    info.append(nome, descricao);
    cabecalho.append(avatar, info);
    
    // Área de mensagens
    const mensagensContainer = criarElemento('div', { 
        className: 'chat-messages',
        id: 'chat-messages'
    });
    
    // Container de input
    const inputContainer = criarElemento('div', { className: 'chat-input-container' });
    
    const input = criarElemento('input', { 
        type: 'text',
        className: 'chat-input',
        placeholder: 'Digite uma mensagem'
    });
    
    const botaoEnviar = criarElemento('button', { className: 'send-button' });
    
    const imgBotao = criarElemento('img', { 
        src: './img/send.png',
        alt: 'Enviar'
    });
    botaoEnviar.appendChild(imgBotao);
    
    inputContainer.append(input, botaoEnviar);
    
    // Adiciona tudo ao fragmento
    fragmento.append(cabecalho, mensagensContainer, inputContainer);
    
    // Limpa e adiciona o novo conteúdo
    areaChat.replaceChildren(fragmento);
    
    // Renderiza as mensagens
    if (conversa.messages?.length > 0) {
        const mensagensFragmento = document.createDocumentFragment();
        
        conversa.messages.forEach(mensagem => {
            const divMensagem = criarElemento('div', { 
                className: `message ${mensagem.sender === 'me' ? 'sent' : 'received'}`
            });
            
            const texto = criarElemento('div', { 
                className: 'message-text',
                textContent: mensagem.content
            });
            
            const hora = criarElemento('div', { 
                className: 'message-time',
                textContent: mensagem.time
            });
            
            divMensagem.append(texto, hora);
            mensagensFragmento.appendChild(divMensagem);
        });
        
        mensagensContainer.appendChild(mensagensFragmento);
        mensagensContainer.scrollTop = mensagensContainer.scrollHeight;
    }
}

// Filtro de busca
campoBusca.addEventListener('input', function() {
    const termo = this.value.toLowerCase();
    const cartoesContato = document.querySelectorAll('.contact-card');

    cartoesContato.forEach(cartao => {
        const nome = cartao.querySelector('.contact-name').textContent.toLowerCase();
        cartao.style.display = nome.includes(termo) ? 'flex' : 'none';
    });
});

// Inicializa o app
document.addEventListener('DOMContentLoaded', carregarContatosConversas);