import { createFileRoute } from "@tanstack/react-router";
import Anthropic from "@anthropic-ai/sdk";

export const Route = createFileRoute("/api/public/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages } = (await request.json()) as {
            messages: { role: "user" | "assistant"; content: string }[];
          };

          const apiKey = process.env.ANTHROPIC_API_KEY;
          if (!apiKey) {
            return new Response(
              JSON.stringify({ error: "ANTHROPIC_API_KEY não configurada no .env" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          const client = new Anthropic({ apiKey });

          const systemPrompt = `Você é o assistente de IA do LBCode Ads — um cockpit de gestão de tráfego pago (Meta Ads + Google Ads). Responda em português do Brasil, de forma clara, objetiva e prática. Quando o usuário pedir análise de campanhas, sugira ações concretas (pausar, escalar, ajustar criativos, públicos, lances). Quando pedir geração de copy/criativos, entregue variações prontas. Use markdown leve quando ajudar.`;

          const stream = client.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 4096,
            system: systemPrompt,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
          });

          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            async start(controller) {
              try {
                for await (const event of stream) {
                  if (
                    event.type === "content_block_delta" &&
                    event.delta.type === "text_delta"
                  ) {
                    const chunk = {
                      choices: [{ delta: { content: event.delta.text } }],
                    };
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`),
                    );
                  }
                }
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              } catch (e) {
                const msg = e instanceof Error ? e.message : "Erro no stream";
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ error: msg })}\n\n`,
                  ),
                );
              } finally {
                controller.close();
              }
            },
          });

          return new Response(readable, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
