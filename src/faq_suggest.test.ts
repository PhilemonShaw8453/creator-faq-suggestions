import { suggestFaqs, type SuggestionServices } from "./faq_suggest.ts";

const calls: string[] = [];
const services: SuggestionServices = {
  async embedding(text) {
    calls.push(`embedding:${text}`);
    return text === "download" || text.startsWith("Download?") ? [1, 0, 0] : [0, 1, 0];
  }
};
const result = await suggestFaqs({ query: "download", faqs: [{ id: "updates", question: "Updates?", answer: "Email" }, { id: "delivery", question: "Download?", answer: "Link" }] }, services);
if (result[0]?.id !== "delivery") throw new Error("FAQ decision test failed");
if (calls.join("|") !== "embedding:download|embedding:Updates?\nEmail|embedding:Download?\nLink") {
  throw new Error(`Unexpected service calls: ${calls.join("|")}`);
}
console.log("passed: download query selects delivery FAQ");
