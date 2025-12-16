import { z } from '@hono/zod-openapi'

export const chatRequestSchema = z.object({
  prompt: z.string().min(1, 'prompt is required'),
  model: z.string().optional()
}).openapi('ChatRequest')

export const chatResponseSchema = z.object({
  text: z.string()
}).openapi('ChatResponse')

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  details: z.unknown().optional()
}).openapi('ErrorResponse')

export type ChatRequest = z.infer<typeof chatRequestSchema>
export type ChatResponse = z.infer<typeof chatResponseSchema>
