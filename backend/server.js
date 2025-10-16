const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Initialize database table
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

// Ollama client
class OllamaClient {
  constructor(baseURL) {
    // Ensure the URL has a protocol and port
    if (baseURL && !baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
      // Add port 11434 if not present
      if (!baseURL.includes(':')) {
        this.baseURL = `http://${baseURL}:11434`;
      } else {
        this.baseURL = `http://${baseURL}`;
      }
    } else {
      this.baseURL = baseURL || 'http://localhost:11434';
    }
  }

  async generateResponse(messages) {
    try {
      console.log('Attempting to connect to Ollama at:', this.baseURL);
      // Try different models in order of preference
      const models = ['llama2:7b', 'mistral:7b', 'llama2', 'mistral'];
      let lastError;
      
      for (const model of models) {
        try {
          console.log(`Trying model: ${model}`);
          const response = await axios.post(`${this.baseURL}/api/chat`, {
            model: model,
            messages: messages,
            stream: false,
            options: {
              temperature: 0.8,
              top_p: 0.9,
              max_tokens: 1000
            }
          }, {
            timeout: 30000 // 30 second timeout
          });
          console.log(`Successfully used model: ${model}`);
          return response.data.message.content;
        } catch (error) {
          console.log(`Model ${model} failed:`, error.response?.data?.error || error.message);
          lastError = error;
          continue;
        }
      }
      
      throw lastError;
    } catch (error) {
      console.error('Ollama API error:', error.message);
      console.error('Ollama URL:', this.baseURL);
      console.error('Full error:', error);
      throw new Error(`Failed to generate response from DM: ${error.message}`);
    }
  }
}

// Try multiple possible Ollama URLs
const getOllamaURL = () => {
  const envURL = process.env.OLLAMA_URL;
  if (envURL) return envURL;
  
  // Try different possible internal service names
  const possibleNames = ['ollama', 'ollama-service', 'ollama-production'];
  return `http://${possibleNames[0]}:11434`;
};

const ollamaClient = new OllamaClient(getOllamaURL());

// DM System Prompt
const DM_SYSTEM_PROMPT = `You are an experienced Dungeon Master for Dungeons & Dragons 5th Edition. Your role is to:

1. Create immersive, engaging narratives and scenarios
2. Describe environments, NPCs, and situations vividly
3. Respond to player actions and decisions appropriately
4. Manage combat encounters when they arise
5. Ask for dice rolls when appropriate (ask players to roll d20, d6, etc.)
6. Maintain the fantasy atmosphere and stay in character
7. Be fair but challenging - create interesting dilemmas
8. Use "you" to address the players directly
9. Keep responses concise but descriptive (2-3 paragraphs max)

You should start each session by setting the scene and asking what the players want to do. Remember that you control the world, but the players control their characters' actions.`;

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'D&D DM Backend is running' });
});

app.get('/api/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT role, content, timestamp FROM chat_messages ORDER BY timestamp ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received chat request:', req.body);
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Save player message to database
    await pool.query(
      'INSERT INTO chat_messages (role, content) VALUES ($1, $2)',
      ['user', message.trim()]
    );

    // Get chat history for context
    const historyResult = await pool.query(
      'SELECT role, content FROM chat_messages ORDER BY timestamp ASC LIMIT 20'
    );

    // Prepare messages for Ollama
    const messages = [
      { role: 'system', content: DM_SYSTEM_PROMPT },
      ...historyResult.rows.map(row => ({
        role: row.role === 'user' ? 'user' : 'assistant',
        content: row.content
      }))
    ];

    // Generate DM response
    const dmResponse = await ollamaClient.generateResponse(messages);

    // Save DM response to database
    await pool.query(
      'INSERT INTO chat_messages (role, content) VALUES ($1, $2)',
      ['assistant', dmResponse]
    );

    res.json({ 
      message: dmResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🎲 D&D DM Backend running on port ${PORT}`);
  await initDatabase();
});
