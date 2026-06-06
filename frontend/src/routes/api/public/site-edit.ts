import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/site-edit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { html, instruction } = (await request.json()) as {
            html: string;
            instruction: string;
          };

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const systemPrompt = `Você é um construtor de sites com IA. Receberá um HTML completo de uma página e uma instrução de mudança. Retorne APENAS o novo HTML completo (sem explicação, sem markdown, sem \`\`\`html, apenas o documento HTML puro começando com <!doctype html> ou <html). Preserve toda a estrutura existente, mudando somente o que foi pedido. Mantenha CSS inline no <style>. Português do Brasil.`;

          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: systemPrompt },
                {
                  role: "user",
                  content: `HTML atual:\n\n${html}\n\n---\n\nInstrução: ${instruction}\n\nRetorne o novo HTML completo.`,
                },
              ],
            }),
          });

          if (!upstream.ok) {
            if (upstream.status === 429) {
              return new Response(
                JSON.stringify({ error: "Muitas requisições. Aguarde alguns segundos." }),
                { status: 429, headers: { "Content-Type": "application/json" } },
              );
            }
            if (upstream.status === 402) {
              return new Response(
                JSON.stringify({ error: "Créditos da IA esgotados." }),
                { status: 402, headers: { "Content-Type": "application/json" } },
              );
            }
            return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const data = await upstream.json();
          let content: string = data.choices?.[0]?.message?.content ?? "";

          // Strip markdown fences if model wraps the HTML
          content = content.trim();
          const fence = content.match(/```(?:html)?\s*([\s\S]*?)```/);
          if (fence) content = fence[1].trim();

          if (!/<html|<!doctype/i.test(content)) {
            return new Response(
              JSON.stringify({ error: "A IA não retornou HTML válido. Tente reformular a instrução." }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          return new Response(JSON.stringify({ html: content }), {
            headers: { "Content-Type": "application/json" },
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
