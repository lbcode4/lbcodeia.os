import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages } = (await request.json()) as {
            messages: { role: "user" | "assistant"; content: string }[];
          };

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return new Response(
              JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          const systemPrompt = `Você é o assistente de IA do LBCode Ads — um cockpit de gestão de tráfego pago (Meta Ads + Google Ads). Responda em português do Brasil, de forma clara, objetiva e prática. Quando o usuário pedir análise de campanhas, sugira ações concretas (pausar, escalar, ajustar criativos, públicos, lances). Quando pedir geração de copy/criativos, entregue variações prontas. Você pode raciocinar como um especialista em performance marketing e também ajudar com dúvidas técnicas de implementação (estilo Claude Code). Use markdown leve quando ajudar.`;

          const upstream = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                stream: true,
                messages: [
                  { role: "system", content: systemPrompt },
                  ...messages,
                ],
              }),
            },
          );

          if (!upstream.ok) {
            if (upstream.status === 429) {
              return new Response(
                JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em instantes." }),
                { status: 429, headers: { "Content-Type": "application/json" } },
              );
            }
            if (upstream.status === 402) {
              return new Response(
                JSON.stringify({ error: "Créditos da IA esgotados. Adicione créditos no workspace." }),
                { status: 402, headers: { "Content-Type": "application/json" } },
              );
            }
            const txt = await upstream.text();
            return new Response(
              JSON.stringify({ error: "Erro no gateway de IA", detail: txt }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          return new Response(upstream.body, {
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
