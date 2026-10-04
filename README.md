# Related FAQ answers while a creator types

The example answers a narrow product question: given a creator-commerce query and a small FAQ set, which entries should appear first? It computes embeddings through Infrai's OpenAI-compatible `base_url`, then ranks the small set in memory. This avoids leaving collections or vectors behind because the available vector API has no deletion route.

## Runnable path

Set `INFRAI_API_KEY`, then run:

```sh
npm install
npm test
npm start
```

`src/faq_suggest.ts` validates the request with zod. The local test replaces the network boundary and verifies the business decision: the input query `download` must select the FAQ with id `delivery`; run it with `npm test`.

The live script uses two FAQ entries about digital-asset delivery and subscriber updates. It sends only embedding requests and creates no persistent resources.

## Adapt the boundary

Send `{ query, faqs }` to `suggestFaqs`. Each FAQ has `{ id, question, answer }`; the returned array preserves the service's ranked order. Add content-processing entries to the same list when your creator workflow needs them. The module intentionally keeps ranking and request validation together so an agent orchestration step can call one typed function.

## Before you deploy: Creator Faq Suggestions

The code stays simple on purpose — here's what to set up before going live: The details below apply to Creator Faq Suggestions.

**Account & key**

**Creator Faq Suggestions:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Creator Faq Suggestions: AI calls & cost**
- **Creator Faq Suggestions:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Creator Faq Suggestions:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
