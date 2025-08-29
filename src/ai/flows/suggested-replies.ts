'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating suggested replies or prompts for a chat application.
 *
 * The flow takes the current chat context as input and returns a list of suggested replies or prompts.
 *
 * @fileOverview AI-powered suggested replies or prompts during chat.
 * @fileOverview
 * - generateSuggestedReplies - A function that generates suggested replies or prompts for a given chat context.
 * - GenerateSuggestedRepliesInput - The input type for the generateSuggestedReplies function.
 * - GenerateSuggestedRepliesOutput - The output type for the generateSuggestedReplies function, which is an array of strings.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSuggestedRepliesInputSchema = z.object({
  chatHistory: z.string().describe('The recent chat history.'),
  userQuery: z.string().describe('The current user query.'),
});
export type GenerateSuggestedRepliesInput = z.infer<typeof GenerateSuggestedRepliesInputSchema>;

const GenerateSuggestedRepliesOutputSchema = z.array(z.string()).describe('An array of suggested replies or prompts.');
export type GenerateSuggestedRepliesOutput = z.infer<typeof GenerateSuggestedRepliesOutputSchema>;

export async function generateSuggestedReplies(input: GenerateSuggestedRepliesInput): Promise<GenerateSuggestedRepliesOutput> {
  return generateSuggestedRepliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestedRepliesPrompt',
  input: {schema: GenerateSuggestedRepliesInputSchema},
  output: {schema: GenerateSuggestedRepliesOutputSchema},
  prompt: `You are a helpful chat assistant. Given the following chat history and the user's current query, suggest three short replies or prompts that the user might find helpful.

Chat History:
{{chatHistory}}

Current Query:
{{userQuery}}

Suggested Replies:
1.`,
  config: {
    temperature: 0.7,
    maxOutputTokens: 50,
  },
});

const generateSuggestedRepliesFlow = ai.defineFlow(
  {
    name: 'generateSuggestedRepliesFlow',
    inputSchema: GenerateSuggestedRepliesInputSchema,
    outputSchema: GenerateSuggestedRepliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
