import { createOllama, ollama } from "ollama-ai-provider-v2";

export const ollamaProvider = process.env.OLLAMA_BASE_URL
  ? createOllama({ baseURL: process.env.OLLAMA_BASE_URL })
  : ollama;

export const defaultModel = process.env.OLLAMA_MODEL ?? "gemma3";
