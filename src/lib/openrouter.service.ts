// src/lib/openrouter.service.ts

/**
 * OpenRouter Service
 * 
 * Service for integrating with OpenRouter API to generate LLM responses.
 * Supports structured JSON outputs, configurable models, and comprehensive error handling.
 */

import type {
  ModelParameters,
  ChatMessage,
  JSONSchema,
  ResponseFormat,
  RequestPayload,
  ApiResponse,
  OpenRouterServiceConfig,
} from './openrouter.types';

// ------------------------------------------------------------------------------------------------
// Custom Error Classes
// ------------------------------------------------------------------------------------------------

/**
 * Base error class for OpenRouter service
 */
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends OpenRouterError {
  constructor(message: string = 'Invalid API key') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends OpenRouterError {
  constructor(message: string = 'API rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends OpenRouterError {
  constructor(message: string = 'Request timeout') {
    super(message, 'TIMEOUT_ERROR', 504);
    this.name = 'TimeoutError';
  }
}

/**
 * Network error
 */
export class NetworkError extends OpenRouterError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR', 503);
    this.name = 'NetworkError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends OpenRouterError {
  constructor(message: string = 'Response validation failed') {
    super(message, 'VALIDATION_ERROR', 422);
    this.name = 'ValidationError';
  }
}

// ------------------------------------------------------------------------------------------------
// Default Configuration
// ------------------------------------------------------------------------------------------------

const DEFAULT_CONFIG = {
  BASE_URL: 'https://openrouter.ai/api/v1/chat/completions',
  TIMEOUT_MS: 60000,
  MAX_RETRIES: 3,
  DEFAULT_MODEL: 'openai/gpt-4',
  DEFAULT_PARAMETERS: {
    temperature: 0.7,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  },
} as const;

// ------------------------------------------------------------------------------------------------
// Logging Utilities
// ------------------------------------------------------------------------------------------------

/**
 * Development mode check
 */
const isDevelopment = import.meta.env.DEV;

/**
 * Safely logs information (excludes sensitive data)
 */
function logInfo(message: string, data?: Record<string, unknown>): void {
  if (!isDevelopment) return;
  
  console.log(`[OpenRouter] ${message}`, data ? sanitizeLogData(data) : '');
}

/**
 * Safely logs errors (excludes sensitive data)
 */
function logError(message: string, error: unknown, data?: Record<string, unknown>): void {
  if (!isDevelopment) return;
  
  console.error(`[OpenRouter ERROR] ${message}`, {
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
    } : 'Unknown error',
    ...((data && sanitizeLogData(data)) || {}),
  });
}

/**
 * Removes sensitive data from log objects
 */
function sanitizeLogData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data };
  
  // Remove API keys and sensitive fields
  const sensitiveFields = ['apiKey', 'api_key', 'authorization', 'password', 'token'];
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

// ------------------------------------------------------------------------------------------------
// Request Metrics
// ------------------------------------------------------------------------------------------------

/**
 * Metrics collected during API request
 */
export interface RequestMetrics {
  model: string;
  requestDuration: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  retryCount: number;
  success: boolean;
}

// ------------------------------------------------------------------------------------------------
// OpenRouter Service Class
// ------------------------------------------------------------------------------------------------

/**
 * Main service class for OpenRouter API integration
 * 
 * Features:
 * - Configurable chat messages (system and user)
 * - Structured JSON outputs via response_format
 * - Model selection and parameter tuning
 * - Retry mechanism with exponential backoff
 * - Comprehensive error handling
 * - Request metrics collection
 */
export class OpenRouterService {
  // Public configuration fields
  public readonly apiUrl: string;
  public readonly apiKey: string;
  public readonly timeout: number;
  public readonly maxRetries: number;

  // Private state fields
  private currentSystemMessage: string = '';
  private currentUserMessage: string = '';
  private currentResponseFormat?: ResponseFormat;
  private currentModelName: string;
  private currentModelParameters: ModelParameters;
  private lastRequestMetrics?: RequestMetrics;

  /**
   * Constructor - Initializes the OpenRouter service
   * 
   * @param config - Optional configuration object
   * @throws {AuthenticationError} If API key is not provided
   */
  constructor(config: OpenRouterServiceConfig = {}) {
    // Validate and set API key
    const apiKey = config.apiKey ?? import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new AuthenticationError('OpenRouter API key is required');
    }

    this.apiKey = apiKey;
    this.apiUrl = config.baseUrl ?? DEFAULT_CONFIG.BASE_URL;
    this.timeout = config.timeout ?? DEFAULT_CONFIG.TIMEOUT_MS;
    this.maxRetries = config.maxRetries ?? DEFAULT_CONFIG.MAX_RETRIES;
    this.currentModelName = config.defaultModel ?? DEFAULT_CONFIG.DEFAULT_MODEL;
    this.currentModelParameters = {
      ...DEFAULT_CONFIG.DEFAULT_PARAMETERS,
      ...config.defaultParameters,
    };
  }

  // ------------------------------------------------------------------------------------------------
  // Public Methods
  // ------------------------------------------------------------------------------------------------

  /**
   * Sets the system message for chat context
   * 
   * @param message - System message content
   */
  public setSystemMessage(message: string): void {
    this.currentSystemMessage = message;
  }

  /**
   * Sets the user message for the chat
   * 
   * @param message - User message content
   */
  public setUserMessage(message: string): void {
    this.currentUserMessage = message;
  }

  /**
   * Configures JSON schema for structured responses
   * 
   * @param schema - JSON schema definition
   */
  public setResponseFormat(schema: JSONSchema): void {
    this.currentResponseFormat = {
      type: 'json_object',
      schema,
    };
  }

  /**
   * Sets the model and its parameters
   * 
   * @param name - Model identifier (e.g., 'openai/gpt-4')
   * @param parameters - Optional model parameters
   */
  public setModel(name: string, parameters?: ModelParameters): void {
    this.currentModelName = name;
    if (parameters) {
      this.currentModelParameters = {
        ...this.currentModelParameters,
        ...parameters,
      };
    }
  }

  /**
   * Gets the metrics from the last API request
   * 
   * @returns Request metrics or undefined if no request has been made
   */
  public getLastRequestMetrics(): RequestMetrics | undefined {
    return this.lastRequestMetrics;
  }

  /**
   * Sends a chat message to OpenRouter API
   * 
   * @param userMessage - User message content (optional if already set via setUserMessage)
   * @returns Parsed response content (JSON if response_format is set, string otherwise)
   * @throws {OpenRouterError} Various error types based on failure mode
   */
  public async sendChatMessage<T = unknown>(userMessage?: string): Promise<T> {
    const startTime = Date.now();
    
    try {
      // Set user message if provided
      if (userMessage) {
        this.currentUserMessage = userMessage;
      }

      // Validate that user message is set
      if (!this.currentUserMessage) {
        throw new ValidationError('User message must be set before sending');
      }

      logInfo('Sending chat message', {
        model: this.currentModelName,
        hasSystemMessage: !!this.currentSystemMessage,
        hasResponseFormat: !!this.currentResponseFormat,
      });

      // Build and execute request
      const payload = this.buildRequestPayload();
      const { response, retryCount } = await this.executeRequest(payload);

      // Extract and parse response
      const parsedResponse = this.parseResponse<T>(response);

      // Collect metrics
      const duration = Date.now() - startTime;
      this.lastRequestMetrics = {
        model: this.currentModelName,
        requestDuration: duration,
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens,
        retryCount,
        success: true,
      };

      logInfo('Chat message completed successfully', {
        duration,
        tokens: response.usage?.total_tokens,
        retries: retryCount,
      });

      return parsedResponse;
    } catch (error) {
      // Collect error metrics
      const duration = Date.now() - startTime;
      this.lastRequestMetrics = {
        model: this.currentModelName,
        requestDuration: duration,
        retryCount: 0,
        success: false,
      };

      logError('Chat message failed', error);
      throw error;
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Private Methods
  // ------------------------------------------------------------------------------------------------

  /**
   * Builds the request payload from current configuration
   * 
   * @returns Complete request payload for OpenRouter API
   */
  private buildRequestPayload(): RequestPayload {
    const messages: ChatMessage[] = [];

    // Add system message if set
    if (this.currentSystemMessage) {
      messages.push({
        role: 'system',
        content: this.currentSystemMessage,
      });
    }

    // Add user message
    messages.push({
      role: 'user',
      content: this.currentUserMessage,
    });

    // Build payload
    const payload: RequestPayload = {
      model: this.currentModelName,
      messages,
      ...this.currentModelParameters,
    };

    // Add response format if configured
    if (this.currentResponseFormat) {
      payload.response_format = this.currentResponseFormat;
    }

    return payload;
  }

  /**
   * Executes HTTP request to OpenRouter API with retry logic
   * 
   * @param requestPayload - Request payload to send
   * @returns API response and retry count
   * @throws {OpenRouterError} Various error types based on failure mode
   */
  private async executeRequest(requestPayload: RequestPayload): Promise<{
    response: ApiResponse;
    retryCount: number;
  }> {
    let lastError: Error | null = null;
    let retryCount = 0;

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          logInfo(`Retry attempt ${attempt}/${this.maxRetries}`);
        }

        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new TimeoutError(`Request timeout after ${this.timeout}ms`)),
            this.timeout,
          ),
        );

        // Create fetch promise
        const fetchPromise = fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://localhost',
            'X-Title': '10x Flashcards',
          },
          body: JSON.stringify(requestPayload),
        });

        // Race between fetch and timeout
        const response = await Promise.race([fetchPromise, timeoutPromise]);

        // Handle HTTP errors
        if (!response.ok) {
          await this.handleHttpError(response);
        }

        // Parse and return response
        const data = await response.json();
        return {
          response: data as ApiResponse,
          retryCount,
        };

      } catch (error) {
        lastError = error as Error;
        retryCount = attempt;

        // Log retry-worthy errors
        if (attempt < this.maxRetries) {
          logError(`Request attempt ${attempt + 1} failed`, error, {
            willRetry: true,
          });
        }

        // Don't retry on authentication or validation errors
        if (error instanceof AuthenticationError || error instanceof ValidationError) {
          throw error;
        }

        // Don't retry on rate limit errors
        if (error instanceof RateLimitError) {
          throw error;
        }

        // If this was the last attempt, throw
        if (attempt === this.maxRetries) {
          break;
        }

        // Calculate backoff delay (exponential: 1s, 2s, 4s, 8s, ...)
        const backoffDelay = Math.pow(2, attempt) * 1000;
        logInfo(`Waiting ${backoffDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }

    // All retries failed
    if (lastError instanceof OpenRouterError) {
      throw lastError;
    }

    throw new NetworkError(
      lastError?.message ?? 'Request failed after all retry attempts',
    );
  }

  /**
   * Handles HTTP error responses
   * 
   * @param response - Fetch response object
   * @throws {OpenRouterError} Appropriate error based on status code
   */
  private async handleHttpError(response: Response): Promise<never> {
    const status = response.status;
    let errorMessage = `HTTP ${status}: ${response.statusText}`;

    try {
      const errorData = await response.json();
      if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
    } catch {
      // Failed to parse error response, use default message
    }

    switch (status) {
      case 401:
        throw new AuthenticationError(errorMessage);
      case 429:
        throw new RateLimitError(errorMessage);
      case 422:
        throw new ValidationError(errorMessage);
      case 503:
      case 504:
        throw new NetworkError(errorMessage);
      default:
        throw new OpenRouterError(errorMessage, 'HTTP_ERROR', status);
    }
  }

  /**
   * Parses and validates API response
   * 
   * @param response - API response object
   * @returns Parsed response content
   * @throws {ValidationError} If response format is invalid
   */
  private parseResponse<T>(response: ApiResponse): T {
    // Validate response structure
    if (!response.choices || response.choices.length === 0) {
      logError('Invalid response structure', new Error('No choices in response'), {
        response,
      });
      throw new ValidationError('API response contains no choices');
    }

    const choice = response.choices[0];
    if (!choice.message || typeof choice.message.content !== 'string') {
      logError('Invalid message format', new Error('Missing or invalid message content'), {
        choice,
      });
      throw new ValidationError('Invalid message format in API response');
    }

    const content = choice.message.content;

    // If response format is JSON, parse and validate it
    if (this.currentResponseFormat) {
      try {
        const parsed = JSON.parse(content) as T;
        
        // Basic validation: ensure it's an object
        if (typeof parsed !== 'object' || parsed === null) {
          throw new ValidationError('Parsed JSON is not an object');
        }

        // If schema has required fields, validate them
        if (this.currentResponseFormat.schema?.required) {
          const requiredFields = this.currentResponseFormat.schema.required;
          for (const field of requiredFields) {
            if (!(field in (parsed as Record<string, unknown>))) {
              throw new ValidationError(`Missing required field in JSON response: ${field}`);
            }
          }
        }

        logInfo('Successfully parsed and validated JSON response');
        return parsed;
      } catch (error) {
        logError('Failed to parse or validate JSON response', error, {
          contentPreview: content.substring(0, 200),
        });
        
        if (error instanceof ValidationError) {
          throw error;
        }
        
        throw new ValidationError(
          `Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Return raw content
    logInfo('Returning raw text response');
    return content as T;
  }
}

// ------------------------------------------------------------------------------------------------
// Factory Function
// ------------------------------------------------------------------------------------------------

/**
 * Creates a new OpenRouter service instance
 * 
 * @param config - Optional configuration
 * @returns Configured OpenRouter service instance
 */
export function createOpenRouterService(config?: OpenRouterServiceConfig): OpenRouterService {
  return new OpenRouterService(config);
}

// ------------------------------------------------------------------------------------------------
// Re-export Types
// ------------------------------------------------------------------------------------------------

export type {
  ModelParameters,
  MessageRole,
  ChatMessage,
  JSONSchema,
  ResponseFormat,
  RequestPayload,
  ApiResponse,
  OpenRouterServiceConfig,
} from './openrouter.types';

