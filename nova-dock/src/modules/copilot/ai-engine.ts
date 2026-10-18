/**
 * Nova AI Engine: Multi-provider streaming client
 * Supports: Claude (Anthropic), OpenAI, Google Gemini, and Local Ollama / LM Studio.
 */

export type AIProvider = 'claude' | 'openai' | 'gemini' | 'ollama' | 'lmstudio';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow: string;
}

export const SUPPORTED_MODELS: AIModel[] = [
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'claude', contextWindow: '200k' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Fast)', provider: 'claude', contextWindow: '200k' },
  { id: 'gpt-4o', name: 'OpenAI GPT-4o', provider: 'openai', contextWindow: '128k' },
  { id: 'gpt-4o-mini', name: 'OpenAI GPT-4o Mini', provider: 'openai', contextWindow: '128k' },
  { id: 'gemini-1.5-pro', name: 'Google Gemini 1.5 Pro', provider: 'gemini', contextWindow: '1M' },
  { id: 'gemini-1.5-flash', name: 'Google Gemini 1.5 Flash', provider: 'gemini', contextWindow: '1M' },
  { id: 'llama3:latest', name: 'Ollama Llama 3 (Local)', provider: 'ollama', contextWindow: '8k' },
  { id: 'deepseek-r1:latest', name: 'Ollama DeepSeek R1 (Local)', provider: 'ollama', contextWindow: '32k' },
  { id: 'local-model', name: 'LM Studio (Local :1234)', provider: 'lmstudio', contextWindow: 'Local' }
];

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  contextAttached?: {
    type: 'clipboard' | 'screenshot' | 'window' | 'file';
    detail: string;
  };
}

export interface PersonaConfig {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

export const DEFAULT_PERSONAS: PersonaConfig[] = [
  {
    id: 'staff-eng',
    name: 'Staff Engineer',
    description: 'Senior architectural guidance, precise code blocks, zero fluff.',
    systemPrompt: 'You are an elite staff-level desktop engineer and systems architect. Provide concise, production-ready, clean solutions with high architectural integrity. Always explain non-obvious engineering decisions.'
  },
  {
    id: 'productivity-coach',
    name: 'Productivity Coach',
    description: 'Structure your day, prioritize ruthless focus, and defeat procrastination.',
    systemPrompt: 'You are an empathetic yet structured executive productivity coach. Help the user prioritize high-leverage work, breakdown overwhelming tasks, and plan deep work blocks.'
  },
  {
    id: 'tech-writer',
    name: 'Technical Writer',
    description: 'Clear, elegant documentation, concise changelogs, and crisp copywriting.',
    systemPrompt: 'You are a principal technical writer. Produce polished, precise, well-structured documentation using clean Markdown and crisp prose.'
  },
  {
    id: 'quick-assistant',
    name: 'Quick Assistant',
    description: 'One-sentence lightning answers to solve immediate problems fast.',
    systemPrompt: 'You are a lightning-fast desktop assistant. Answer in 1-2 direct sentences without pleasantries.'
  }
];

export class AIEngine {
  private static abortController: AbortController | null = null;

  public static async streamCompletion(params: {
    provider: AIProvider;
    model: string;
    apiKey: string;
    messages: ChatMessage[];
    systemPrompt: string;
    onChunk: (chunk: string) => void;
    onError: (error: string) => void;
    onComplete: () => void;
  }): Promise<void> {
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      if (params.provider === 'claude') {
        await this.streamClaude(params, signal);
      } else if (params.provider === 'openai') {
        await this.streamOpenAI(params, signal, 'https://api.openai.com/v1/chat/completions');
      } else if (params.provider === 'gemini') {
        await this.streamGemini(params, signal);
      } else if (params.provider === 'ollama') {
        await this.streamOllama(params, signal);
      } else if (params.provider === 'lmstudio') {
        await this.streamOpenAI(params, signal, 'http://localhost:1234/v1/chat/completions');
      }
      params.onComplete();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        params.onComplete();
      } else {
        params.onError(err.message || 'Failed to complete AI request.');
      }
    }
  }

  public static cancelStream(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  // --- Claude (Anthropic API) ---
  private static async streamClaude(params: any, signal: AbortSignal): Promise<void> {
    if (!params.apiKey) throw new Error('Anthropic API key is missing. Set it in AI Settings.');

    const formattedMessages = params.messages
      .filter((m: ChatMessage) => m.role !== 'system')
      .map((m: ChatMessage) => ({
        role: m.role,
        content: m.content
      }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': params.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: params.model,
        max_tokens: 2048,
        system: params.systemPrompt,
        messages: formattedMessages,
        stream: true
      }),
      signal
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Claude API Error (${response.status}): ${errBody}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Readable stream not supported.');
    const decoder = new TextDecoder();

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            if (data.type === 'content_block_delta' && data.delta?.text) {
              params.onChunk(data.delta.text);
            }
          } catch {}
        }
      }
    }
  }

  // --- OpenAI / LM Studio ---
  private static async streamOpenAI(params: any, signal: AbortSignal, endpoint: string): Promise<void> {
    const isLocal = endpoint.includes('localhost');
    if (!isLocal && !params.apiKey) throw new Error('OpenAI API key is missing. Set it in AI Settings.');

    const formattedMessages = [
      { role: 'system', content: params.systemPrompt },
      ...params.messages.map((m: ChatMessage) => ({ role: m.role, content: m.content }))
    ];

    const headers: Record<string, string> = {
      'content-type': 'application/json'
    };
    if (params.apiKey) headers['Authorization'] = `Bearer ${params.apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: params.model,
        messages: formattedMessages,
        stream: true
      }),
      signal
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`OpenAI Error (${response.status}): ${errBody}`);
    }

    const reader = response.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            const content = data.choices?.[0]?.delta?.content;
            if (content) params.onChunk(content);
          } catch {}
        }
      }
    }
  }

  // --- Google Gemini ---
  private static async streamGemini(params: any, signal: AbortSignal): Promise<void> {
    if (!params.apiKey) throw new Error('Gemini API key is missing.');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:streamGenerateContent?key=${params.apiKey}&alt=sse`;
    const contents = params.messages.map((m: ChatMessage) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: params.systemPrompt }] }
      }),
      signal
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini Error (${response.status}): ${errBody}`);
    }

    const reader = response.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6).trim());
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) params.onChunk(text);
          } catch {}
        }
      }
    }
  }

  // --- Local Ollama ---
  private static async streamOllama(params: any, signal: AbortSignal): Promise<void> {
    const formattedMessages = [
      { role: 'system', content: params.systemPrompt },
      ...params.messages.map((m: ChatMessage) => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: params.model,
        messages: formattedMessages,
        stream: true
      }),
      signal
    });

    if (!response.ok) {
      throw new Error(`Ollama Error: Is Ollama running on http://localhost:11434?`);
    }

    const reader = response.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.message?.content) params.onChunk(data.message.content);
        } catch {}
      }
    }
  }
}
