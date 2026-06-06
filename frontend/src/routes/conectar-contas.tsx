import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Card, Badge, Button } from "@/components/app-shell";
import { metaAccounts, clients as seedClients } from "@/lib/mock";
import { Facebook, Search as GoogleIcon, Plug, Check, X as XIcon, Plus } from "lucide-react";

export const Route = createFileRoute("/conectar-contas")({
  head: () => ({ meta: [{ title: "Conectar Contas — LBCode Ads" }, { name: "description", content: "Conecte Meta e Google Ads e cadastre clientes." }] }),
  component: ConectarContas,
});

function ConectarContas() {
  const [clients, setClients] = useState(seedClients);
  const [form, setForm] = useState({ name: "", metaAct: "", igUserId: "", handle: "", googleAdsId: "", ativo: true });

  const save = () => {
    if (!form.name) return;
    setClients((p) => [...p, { id: form.name.toLowerCase().replace(/\s+/g, "-"), ...form }]);
    setForm({ name: "", metaAct: "", igUserId: "", handle: "", googleAdsId: "", ativo: true });
  };

  return (
    <>
      <PageHeader title="Conectar Contas" subtitle="Conecte plataformas, cadastre clientes e vincule contas de anúncios." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                <Facebook size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Meta Ads</h3>
                <p className="text-[12px] text-muted-foreground">Facebook + Instagram Ads</p>
              </div>
            </div>
            <Badge tone="success"><Check size={10} className="mr-0.5 inline" /> Conectado</Badge>
          </div>
          <Button variant="secondary" className="w-full">Reconectar</Button>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                <GoogleIcon size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Google Ads</h3>
                <p className="text-[12px] text-muted-foreground">Search + Performance Max</p>
              </div>
            </div>
            <Badge tone="neutral"><XIcon size={10} className="mr-0.5 inline" /> Desconectado</Badge>
          </div>
          <div className="rounded-md border border-dashed border-border p-4 text-center mb-4">
            <Plug size={20} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-[13px] text-muted-foreground">Cole o developer token + OAuth2 para conectar.</p>
          </div>
          <Button className="w-full">Conectar</Button>
        </Card>
      </div>

      <h2 className="text-lg font-semibold mb-3">Contas Meta acessíveis</h2>
      <Card className="!p-0 overflow-hidden mb-8">
        <table className="w-full text-[13px]">
          <thead className="text-muted-foreground bg-muted/40">
            <tr>
              <th className="text-left font-medium py-2 px-4">Conta</th>
              <th className="text-left font-medium py-2 px-4">ID</th>
              <th className="text-left font-medium py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {metaAccounts.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="py-3 px-4 font-medium">{a.conta}</td>
                <td className="py-3 px-4 font-mono text-muted-foreground">{a.id}</td>
                <td className="py-3 px-4">
                  <Badge tone={a.status === "Ativo" ? "success" : "neutral"}>{a.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <h2 className="text-lg font-semibold mb-3">Cadastrar cliente → conta</h2>
      <Card className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome do cliente" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Ex: Dordrian Store" />
          <Field label="Meta Ad Account" value={form.metaAct} onChange={(v) => setForm({ ...form, metaAct: v })} placeholder="act_..." />
          <Field label="IG User ID" value={form.igUserId} onChange={(v) => setForm({ ...form, igUserId: v })} placeholder="178492..." />
          <Field label="Handle IG" value={form.handle} onChange={(v) => setForm({ ...form, handle: v })} placeholder="@nome" />
          <Field label="Google Ads ID" value={form.googleAdsId} onChange={(v) => setForm({ ...form, googleAdsId: v })} placeholder="123-456-7890" />
          <div>
            <label className="text-[12px] uppercase tracking-wide text-muted-foreground block mb-1.5">Ativo</label>
            <label className="inline-flex items-center gap-2 h-10">
              <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
              <span className="text-[14px]">Cliente ativo no painel</span>
            </label>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={save}><Plus size={14} /> Salvar</Button>
        </div>
      </Card>

      <h2 className="text-lg font-semibold mb-3">Clientes cadastrados</h2>
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium py-2 px-4">Cliente</th>
                <th className="text-left font-medium py-2 px-4">Meta Ad Account</th>
                <th className="text-left font-medium py-2 px-4">IG User ID</th>
                <th className="text-left font-medium py-2 px-4">Handle</th>
                <th className="text-left font-medium py-2 px-4">Google Ads</th>
                <th className="text-left font-medium py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4 font-medium">{c.name}</td>
                  <td className="py-3 px-4 font-mono text-muted-foreground">{c.metaAct}</td>
                  <td className="py-3 px-4 font-mono text-muted-foreground">{c.igUserId}</td>
                  <td className="py-3 px-4 text-muted-foreground">{c.handle}</td>
                  <td className="py-3 px-4 font-mono text-muted-foreground">{c.googleAdsId}</td>
                  <td className="py-3 px-4">
                    <Badge tone={c.ativo ? "success" : "neutral"}>{c.ativo ? "Ativo" : "Inativo"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[12px] uppercase tracking-wide text-muted-foreground block mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 rounded-md border border-border bg-card px-3 text-[14px]"
      />
    </div>
  );
}
