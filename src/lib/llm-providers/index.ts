import { LLMProvider, BatchResponse } from '@/types';

interface StreamingCallbacks {
  onStream: (providerId: string, chunk: string, isComplete: boolean) => void;
  onComplete: (providerId: string, response: string, metadata: any) => void;
  onError: (providerId: string, error: string) => void;
}

interface ProviderRequest {
  providerId: string;
  message: string;
  apiKey: string;
  endpoint: string;
  model: string;
  streaming?: boolean;
}

// Provider-specific implementations
class OpenAIProvider {
  static async sendRequest(
    request: ProviderRequest,
    callbacks?: StreamingCallbacks
  ): Promise<BatchResponse | void> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(request.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${request.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          messages: [{ role: 'user', content: request.message }],
          stream: request.streaming || false,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      if (request.streaming && callbacks) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n').filter(line => line.trim() !== '');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    callbacks.onComplete(request.providerId, fullResponse, {
                      tokensUsed: fullResponse.length / 4, // Rough estimate
                      responseTime: Date.now() - startTime,
                      model: request.model,
                    });
                    return;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices[0]?.delta?.content || '';
                    if (content) {
                      fullResponse += content;
                      callbacks.onStream(request.providerId, content, false);
                    }
                  } catch (e) {
                    console.error('Failed to parse OpenAI stream:', e);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        }
      } else {
        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';
        const tokensUsed = data.usage?.total_tokens || 0;

        return {
          providerId: request.providerId,
          response: content,
          metadata: {
            tokensUsed,
            responseTime: Date.now() - startTime,
            model: request.model,
            cost: (tokensUsed / 1000) * 0.03, // Example cost calculation
          },
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (callbacks) {
        callbacks.onError(request.providerId, errorMessage);
      } else {
        throw error;
      }
    }
  }
}

class AnthropicProvider {
  static async sendRequest(
    request: ProviderRequest,
    callbacks?: StreamingCallbacks
  ): Promise<BatchResponse | void> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(request.endpoint, {
        method: 'POST',
        headers: {
          'x-api-key': request.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: request.model,
          messages: [{ role: 'user', content: request.message }],
          max_tokens: 4096,
          stream: request.streaming || false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      if (request.streaming && callbacks) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n').filter(line => line.trim() !== '');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.type === 'content_block_delta') {
                      const content = parsed.delta?.text || '';
                      if (content) {
                        fullResponse += content;
                        callbacks.onStream(request.providerId, content, false);
                      }
                    } else if (parsed.type === 'message_stop') {
                      callbacks.onComplete(request.providerId, fullResponse, {
                        tokensUsed: fullResponse.length / 4, // Rough estimate
                        responseTime: Date.now() - startTime,
                        model: request.model,
                      });
                      return;
                    }
                  } catch (e) {
                    console.error('Failed to parse Anthropic stream:', e);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        }
      } else {
        const data = await response.json();
        const content = data.content[0]?.text || '';
        
        return {
          providerId: request.providerId,
          response: content,
          metadata: {
            tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens || 0,
            responseTime: Date.now() - startTime,
            model: request.model,
            cost: ((data.usage?.input_tokens || 0) / 1000) * 0.015 + 
                  ((data.usage?.output_tokens || 0) / 1000) * 0.075,
          },
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (callbacks) {
        callbacks.onError(request.providerId, errorMessage);
      } else {
        throw error;
      }
    }
  }
}

class OpenRouterProvider {
  static async sendRequest(
    request: ProviderRequest,
    callbacks?: StreamingCallbacks
  ): Promise<BatchResponse | void> {
    // OpenRouter uses OpenAI-compatible API
    return OpenAIProvider.sendRequest(
      {
        ...request,
        endpoint: request.endpoint,
      },
      callbacks
    );
  }
}

class GrokProvider {
  static async sendRequest(
    request: ProviderRequest,
    callbacks?: StreamingCallbacks
  ): Promise<BatchResponse | void> {
    // Grok uses OpenAI-compatible API
    return OpenAIProvider.sendRequest(request, callbacks);
  }
}

// Provider registry
const PROVIDERS = {
  openai: OpenAIProvider,
  anthropic: AnthropicProvider,
  openrouter: OpenRouterProvider,
  grok: GrokProvider,
} as const;

// Main function to send messages to multiple providers
export async function sendToLLMProviders(
  message: string,
  providerIds: string[],
  callbacks?: StreamingCallbacks
): Promise<BatchResponse[]> {
  const providers: LLMProvider[] = [
    {
      id: 'openai',
      name: 'OpenAI GPT-4',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4-turbo-preview',
      supportsStreaming: true,
      maxTokens: 4096,
      costPer1kTokens: 0.03,
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      endpoint: 'https://api.anthropic.com/v1/messages',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: 'claude-3-opus-20240229',
      supportsStreaming: true,
      maxTokens: 4096,
      costPer1kTokens: 0.015,
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: process.env.OPENROUTER_API_KEY || '',
      model: 'anthropic/claude-3-opus',
      supportsStreaming: true,
      maxTokens: 4096,
      costPer1kTokens: 0.015,
    },
    {
      id: 'grok',
      name: 'Grok',
      endpoint: 'https://api.x.ai/v1/chat/completions',
      apiKey: process.env.GROK_API_KEY || '',
      model: 'grok-beta',
      supportsStreaming: true,
      maxTokens: 4096,
      costPer1kTokens: 0.01,
    },
  ];

  const selectedProviders = providers.filter(p => providerIds.includes(p.id));
  const requests: Promise<BatchResponse | void>[] = [];

  for (const provider of selectedProviders) {
    if (!provider.apiKey) {
      console.warn(`No API key found for provider: ${provider.id}`);
      if (callbacks) {
        callbacks.onError(provider.id, `No API key configured for ${provider.name}`);
      }
      continue;
    }

    const ProviderClass = PROVIDERS[provider.id as keyof typeof PROVIDERS];
    if (!ProviderClass) {
      console.warn(`No implementation found for provider: ${provider.id}`);
      if (callbacks) {
        callbacks.onError(provider.id, `Provider ${provider.name} is not implemented`);
      }
      continue;
    }

    const request: ProviderRequest = {
      providerId: provider.id,
      message,
      apiKey: provider.apiKey,
      endpoint: provider.endpoint,
      model: provider.model,
      streaming: !!callbacks,
    };

    requests.push(ProviderClass.sendRequest(request, callbacks));
  }

  if (callbacks) {
    // For streaming, we don't wait for results
    await Promise.allSettled(requests);
    return [];
  } else {
    // For batch responses, return results
    const results = await Promise.allSettled(requests);
    return results
      .filter((result): result is PromiseFulfilledResult<BatchResponse> => 
        result.status === 'fulfilled' && result.value !== undefined
      )
      .map(result => result.value);
  }
}