// src/lib/openrouter.types.ts

/**
 * Types and interfaces for OpenRouter Service
 */

// ------------------------------------------------------------------------------------------------
// Model Configuration
// ------------------------------------------------------------------------------------------------

/**
 * Model parameters for fine-tuning LLM behavior
 */
export interface ModelParameters {
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

// ------------------------------------------------------------------------------------------------
// Chat Messages
// ------------------------------------------------------------------------------------------------

/**
 * Message role types supported by the chat API
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * Chat message structure
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

// ------------------------------------------------------------------------------------------------
// Response Format & JSON Schema
// ------------------------------------------------------------------------------------------------

/**
 * JSON Schema for structured outputs
 */
export interface JSONSchema {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
  [key: string]: unknown;
}

/**
 * Response format configuration for structured outputs
 */
export interface ResponseFormat {
  type: 'json_object';
  schema?: JSONSchema;
}

// ------------------------------------------------------------------------------------------------
// API Request/Response
// ------------------------------------------------------------------------------------------------

/**
 * Request payload sent to OpenRouter API
 */
export interface RequestPayload {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  response_format?: ResponseFormat;
}

/**
 * API response from OpenRouter
 */
export interface ApiResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ------------------------------------------------------------------------------------------------
// Service Configuration
// ------------------------------------------------------------------------------------------------

/**
 * Service configuration options
 */
export interface OpenRouterServiceConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  defaultModel?: string;
  defaultParameters?: ModelParameters;
}

