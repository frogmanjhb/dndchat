const axios = require('axios');

class OllamaClient {
  constructor(baseURL = 'http://localhost:11434') {
    this.baseURL = baseURL;
  }

  async checkModel(model = 'llama2:7b') {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      const models = response.data.models || [];
      return models.some(m => m.name === model);
    } catch (error) {
      console.error('Error checking model:', error);
      return false;
    }
  }

  async pullModel(model = 'llama2:7b') {
    try {
      console.log(`Pulling model ${model}...`);
      const response = await axios.post(`${this.baseURL}/api/pull`, {
        name: model,
        stream: false
      });
      console.log(`Model ${model} pulled successfully`);
      return true;
    } catch (error) {
      console.error(`Error pulling model ${model}:`, error);
      return false;
    }
  }

  async generateResponse(messages, model = 'llama2:7b') {
    try {
      const response = await axios.post(`${this.baseURL}/api/chat`, {
        model: model,
        messages: messages,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.9,
          max_tokens: 1000
        }
      });
      return response.data.message.content;
    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error('Failed to generate response from DM');
    }
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

module.exports = OllamaClient;
