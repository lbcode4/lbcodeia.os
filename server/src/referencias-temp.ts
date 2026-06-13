import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { join, resolve, extname } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const TEMP_ROOT = join(REPO_ROOT, "_referencias-temp");

const MIME_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function resolveSession(sessionId: string): string {
  if (!UUID_RE.test(sessionId)) throw new Error("sessionId inválido");
  const dir = resolve(join(TEMP_ROOT, sessionId));
  if (!dir.startsWith(resolve(TEMP_ROOT))) throw new Error("Caminho inválido");
  return dir;
}

export async function saveReferencia(sessionId: string, ext: string, data: Buffer): Promise<string> {
  const mime = MIME_MAP[ext.toLowerCase()];
  if (!mime) throw new Error("Tipo inválido");
  const dir = resolveSession(sessionId);
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}${ext.toLowerCase()}`;
  await writeFile(join(dir, filename), data);
  return filename;
}

export async function readReferencia(sessionId: string, filename: string): Promise<{ buf: Buffer; mime: string }> {
  const ext = extname(filename).toLowerCase();
  const mime = MIME_MAP[ext];
  if (!mime) throw new Error("Tipo inválido");
  const dir = resolveSession(sessionId);
  const safe = resolve(join(dir, filename));
  if (!safe.startsWith(resolve(TEMP_ROOT))) throw new Error("Caminho inválido");
  return { buf: (await readFile(safe)) as Buffer, mime };
}

export async function deleteReferencias(sessionId: string): Promise<void> {
  const dir = resolveSession(sessionId);
  await rm(dir, { recursive: true, force: true });
}
