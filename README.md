# 🎲 D&D DM Chatbot

A Dungeons & Dragons Dungeon Master chatbot built with React and Ollama, designed to provide an immersive D&D experience through AI-powered storytelling and game management.

## Features

- **AI Dungeon Master**: Powered by Ollama with a custom D&D-focused system prompt
- **Interactive Chat Interface**: Clean, responsive React frontend with D&D theming
- **Session Persistence**: Chat history stored in PostgreSQL database
- **Railway Deployment**: Easy deployment with multi-service configuration
- **Real-time Communication**: WebSocket-like experience with loading states

## Architecture

- **Frontend**: React + Vite with custom D&D-themed UI
- **Backend**: Node.js + Express API server
- **LLM**: Ollama service (supports Llama 2, Mistral, and other models)
- **Database**: PostgreSQL for chat history persistence
- **Deployment**: Railway with Docker containers

## Quick Start

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd dndchat
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database URL
   ```

3. **Start Ollama locally:**
   ```bash
   # Install Ollama from https://ollama.ai
   ollama pull llama2:7b
   ollama serve
   ```

4. **Start the development servers:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Railway Deployment

1. **Connect to Railway:**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Add PostgreSQL database:**
   ```bash
   railway add postgresql
   ```

3. **Deploy services:**
   ```bash
   railway up
   ```

4. **Set environment variables in Railway dashboard:**
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `OLLAMA_URL`: `http://ollama:11434` (internal service URL)

## Configuration

### DM System Prompt

The chatbot uses a carefully crafted system prompt that establishes the DM personality:

- Creates immersive, engaging narratives
- Describes environments and NPCs vividly
- Manages combat encounters and dice rolls
- Maintains fantasy atmosphere
- Responds appropriately to player actions

### Supported Models

The system works with various Ollama models:
- `llama2:7b` (recommended for good balance of speed/quality)
- `llama2:13b` (better quality, slower)
- `mistral:7b` (alternative option)
- `codellama:7b` (if you want to experiment)

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/history` - Retrieve chat history
- `POST /api/chat` - Send message to DM

## Development

### Project Structure

```
dndchat/
├── backend/           # Express API server
│   ├── server.js     # Main server file
│   ├── ollama-client.js # Ollama integration
│   └── package.json
├── frontend/         # React application
│   ├── src/
│   │   ├── App.jsx   # Main chat interface
│   │   └── components/
│   └── package.json
├── railway.toml      # Railway configuration
└── README.md
```

### Adding Features

- **Character Sheets**: Extend the database schema to store character data
- **Dice Rolling**: Add client-side dice rolling with server validation
- **Campaign Management**: Implement save/load functionality for campaigns
- **Voice Integration**: Add text-to-speech for DM responses

## Troubleshooting

### Common Issues

1. **Ollama connection failed**: Ensure Ollama is running and accessible
2. **Database connection error**: Check your DATABASE_URL environment variable
3. **CORS errors**: Verify the backend CORS configuration matches your frontend URL

### Logs

Check Railway logs for debugging:
```bash
railway logs
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

**Happy Adventuring!** 🏰⚔️🐉
