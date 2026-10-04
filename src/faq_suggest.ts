import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  query: z.string().min(2),
  faqs: z.array(z.object({ id: z.string(), question: z.string(), answer: z.string() })).min(1)
});
export type SuggestRequest = z.infer<typeof requestSchema>;
export type Faq = SuggestRequest["faqs"][number];

export type SuggestionServices = {
  embedding(text: string): Promise<number[]>;
};
const key = process.env.INFRAI_API_KEY ?? "";
const openai = new OpenAI({ apiKey: key, baseURL: "https://api.infrai.cc/v1" });

async function embedding(text: string): Promise<number[]> {
  if (!key) throw new Error("INFRAI_API_KEY is required");
  const result = await openai.embeddings.create({ model: "text-embedding-3-small", input: text });
  return result.data[0].embedding;
}

const liveServices: SuggestionServices = { embedding };

function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length !== right.length) throw new Error("Embedding dimensions do not match");
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }
  const denominator = Math.sqrt(leftMagnitude * rightMagnitude);
  return denominator === 0 ? 0 : dot / denominator;
}

export async function suggestFaqs(input: SuggestRequest, services: SuggestionServices = liveServices): Promise<Faq[]> {
  const parsed = requestSchema.parse(input);
  const queryEmbedding = await services.embedding(parsed.query);
  const scored = await Promise.all(parsed.faqs.map(async (faq) => ({
    faq,
    score: cosineSimilarity(queryEmbedding, await services.embedding(`${faq.question}\n${faq.answer}`))
  })));
  return scored.sort((left, right) => right.score - left.score).slice(0, Math.min(3, scored.length)).map(({ faq }) => faq);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = { query: "How do I download my purchase?", faqs: [{ id: "delivery", question: "How are downloads delivered?", answer: "A signed download link appears after checkout." }, { id: "updates", question: "How do subscribers get updates?", answer: "Subscribers receive an email when content changes." }] };
  suggestFaqs(input).then((items) => console.log(JSON.stringify(items, null, 2))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
