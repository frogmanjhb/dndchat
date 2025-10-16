import React, { useState, useEffect, useRef } from 'react'
import ChatMessage from './components/ChatMessage'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Load chat history on component mount
    fetchChatHistory()
  }, [])

  const fetchChatHistory = async () => {
    try {
      const response = await fetch('/api/history')
      if (response.ok) {
        const history = await response.json()
        setMessages(history)
      }
    } catch (error) {
      console.error('Error fetching chat history:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)

    // Add user message to UI immediately
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, newUserMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      })

      if (response.ok) {
        const data = await response.json()
        const dmMessage = {
          role: 'assistant',
          content: data.message,
          timestamp: data.timestamp
        }
        setMessages(prev => [...prev, dmMessage])
      } else {
        const errorData = await response.json()
        console.error('Error sending message:', errorData)
        // Add error message to chat
        const errorMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const startNewSession = () => {
    setMessages([])
    setInputMessage('')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎲 D&D Dungeon Master</h1>
        <button onClick={startNewSession} className="new-session-btn">
          New Session
        </button>
      </header>

      <div className="chat-container">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <h2>Welcome, Adventurers! 🏰</h2>
              <p>I am your Dungeon Master. Tell me what you'd like to do, and let's begin your adventure!</p>
              <p>You can ask me to:</p>
              <ul>
                <li>Create a new character</li>
                <li>Start a new adventure</li>
                <li>Explore a dungeon or town</li>
                <li>Engage in combat</li>
                <li>Or anything else you can imagine!</li>
              </ul>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))
          )}
          {isLoading && (
            <div className="loading-message">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>The DM is thinking...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="input-form">
          <div className="input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="What do you want to do?"
              disabled={isLoading}
              className="message-input"
            />
            <button 
              type="submit" 
              disabled={!inputMessage.trim() || isLoading}
              className="send-button"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default App
