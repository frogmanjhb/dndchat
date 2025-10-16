import React from 'react'
import './ChatMessage.css'

function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const isDM = message.role === 'assistant'
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`message ${isUser ? 'user-message' : 'dm-message'}`}>
      <div className="message-header">
        <span className="message-role">
          {isUser ? '🧙‍♂️ Player' : '🎲 DM'}
        </span>
        <span className="message-time">
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
      <div className="message-content">
        {message.content.split('\n').map((line, index) => (
          <p key={index} className="message-text">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

export default ChatMessage
