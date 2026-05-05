import React, { useState, useEffect, useRef } from 'react';
import '../styles/ChatScreen.css';

const ChatScreen = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTeacher, setIsTeacher] = useState(false); // Mock - será do contexto
  const messagesEndRef = useRef(null);

  // Dados serão carregados da API
  useEffect(() => {
    const loadChats = async () => {
      try {
        // TODO: Implementar chamada para API de chats
        // const response = await fetch('/api/chats');
        // const data = await response.json();
        // setChats(data);
        setChats([]); // Vazio por enquanto
        setSelectedChat(null);
      } catch (error) {
        console.error('Erro ao carregar chats:', error);
        setChats([]);
        setSelectedChat(null);
      }
    };

    loadChats();
  }, []);

  // Carregar mensagens do chat selecionado
  useEffect(() => {
    if (selectedChat) {
      const loadMessages = async () => {
        try {
          // TODO: Implementar chamada para API de mensagens
          // const response = await fetch(`/api/chats/${selectedChat.id}/messages`);
          // const data = await response.json();
          // setMessages(data);
          setMessages([]); // Vazio por enquanto
        } catch (error) {
          console.error('Erro ao carregar mensagens:', error);
          setMessages([]);
        }
      };

      loadMessages();
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  // Scroll para o final das mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: 'Você', // Mock - será do usuário logado
        senderType: 'student',
        content: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachFile = () => {
    // Implementar upload de arquivo
    console.log('Anexar arquivo');
  };

  const handleAttachProject = () => {
    // Implementar compartilhamento de projeto
    console.log('Compartilhar projeto');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  return (
    <div className="chat-screen">
      {/* Sidebar com lista de chats */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Conversas</h2>
        </div>

        <div className="chats-list">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => setSelectedChat(chat)}
            >
              <div className="chat-avatar">
                {chat.type === 'classroom' ? 'Turma' : 'Geral'}
              </div>

              <div className="chat-info">
                <div className="chat-name">{chat.name}</div>
                <div className="chat-last-message">{chat.lastMessage}</div>
                <div className="chat-meta">
                  <span className="chat-time">
                    {formatTime(chat.lastMessageTime)}
                  </span>
                  {chat.unreadCount > 0 && (
                    <span className="unread-badge">{chat.unreadCount}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área principal do chat */}
      <div className="chat-main">
        {selectedChat ? (
          <>
            {/* Header do chat */}
            <div className="chat-header">
              <div className="chat-title">
                <span className="chat-icon">
                  {selectedChat.type === 'classroom' ? 'Turma' : 'Geral'}
                </span>
                <div>
                  <h3>{selectedChat.name}</h3>
                  <p>{selectedChat.participants} participantes</p>
                </div>
              </div>

              {isTeacher && (
                <div className="teacher-actions">
                  <button className="action-btn">Fixar mensagem</button>
                  <button className="action-btn">Moderar</button>
                </div>
              )}
            </div>

            {/* Área de mensagens */}
            <div className="messages-area">
              {messages.map(message => (
                <div key={message.id} className="message-group">
                  <div className="message-date">
                    {formatDate(message.timestamp)}
                  </div>

                  <div className={`message ${message.senderType === 'teacher' ? 'teacher' : 'student'}`}>
                    <div className="message-avatar">
                      {message.senderType === 'teacher' ? 'Professor' : 'Aluno'}
                    </div>

                    <div className="message-content">
                      <div className="message-header">
                        <span className="sender-name">{message.sender}</span>
                        <span className="message-time">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <div className="message-text">{message.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-area">
              <div className="input-container">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="message-input"
                  rows="1"
                />

                <div className="input-actions">
                  <button
                    className="attach-btn"
                    onClick={handleAttachFile}
                    title="Anexar arquivo"
                  >
                    Anexar
                  </button>
                  <button
                    className="attach-btn"
                    onClick={handleAttachProject}
                    title="Compartilhar projeto"
                  >
                    Projeto
                  </button>
                  <button
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Selecione uma conversa para começar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatScreen;