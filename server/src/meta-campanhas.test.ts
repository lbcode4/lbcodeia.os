// server/src/meta-campanhas.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { listCampanhas, setCampanhaStatus, listAdsets, setAdsetStatus } from "./meta-campanhas.js";

const TOKEN = "test-token";
const ACCOUNT_ID = "act_123";
const CAMPAIGN_ID = "cam_456";
const ADSET_ID = "ads_789";

const mockFetch = vi.fn();
beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();
});

function mockGraphOk(data: unknown) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => data,
  } as Response);
}

function mockGraphError(status: number, message: string) {
  mockFetch.mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ error: { message, code: 1 } }),
  } as Response);
}

describe("listCampanhas", () => {
  it("fetches active and paused campaigns for account", async () => {
    const apiData = {
      data: [
        { id: "1", name: "Camp A", status: "ACTIVE", effective_status: "ACTIVE", objective: "MESSAGES", daily_budget: "5000" },
        { id: "2", name: "Camp B", status: "PAUSED", effective_status: "PAUSED", objective: "REACH" },
      ],
    };
    mockGraphOk(apiData);
    const result = await listCampanhas(ACCOUNT_ID, TOKEN);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Camp A");
    expect(result[1].status).toBe("PAUSED");
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain(ACCOUNT_ID);
    expect(url).toContain("campaigns");
    expect(url).toContain(TOKEN);
  });

  it("filters out archived/deleted campaigns", async () => {
    mockGraphOk({
      data: [
        { id: "1", name: "Camp A", status: "ACTIVE", effective_status: "ACTIVE", objective: "MESSAGES" },
        { id: "2", name: "Camp B", status: "ARCHIVED", effective_status: "ARCHIVED", objective: "REACH" },
        { id: "3", name: "Camp C", status: "DELETED", effective_status: "DELETED", objective: "REACH" },
      ],
    });
    const result = await listCampanhas(ACCOUNT_ID, TOKEN);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("throws on Graph API error", async () => {
    mockGraphError(400, "Invalid account");
    await expect(listCampanhas(ACCOUNT_ID, TOKEN)).rejects.toThrow("Invalid account");
  });
});

describe("setCampanhaStatus", () => {
  it("POSTs status to campaign endpoint", async () => {
    mockGraphOk({ success: true });
    await setCampanhaStatus(CAMPAIGN_ID, "PAUSED", TOKEN);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(CAMPAIGN_ID);
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body as string);
    expect(body.status).toBe("PAUSED");
  });

  it("throws on Graph API error", async () => {
    mockGraphError(400, "Permission denied");
    await expect(setCampanhaStatus(CAMPAIGN_ID, "ACTIVE", TOKEN)).rejects.toThrow("Permission denied");
  });
});

describe("listAdsets", () => {
  it("fetches adsets for campaign, filters out non-active/paused", async () => {
    mockGraphOk({
      data: [
        { id: "a1", name: "Adset 1", status: "ACTIVE", effective_status: "ACTIVE", daily_budget: "2500" },
        { id: "a2", name: "Adset 2", status: "ARCHIVED", effective_status: "ARCHIVED" },
      ],
    });
    const result = await listAdsets(CAMPAIGN_ID, TOKEN);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a1");
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain(CAMPAIGN_ID);
    expect(url).toContain("adsets");
  });
});

describe("setAdsetStatus", () => {
  it("POSTs status to adset endpoint", async () => {
    mockGraphOk({ success: true });
    await setAdsetStatus(ADSET_ID, "ACTIVE", TOKEN);
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(ADSET_ID);
    const body = JSON.parse(opts.body as string);
    expect(body.status).toBe("ACTIVE");
  });
});
