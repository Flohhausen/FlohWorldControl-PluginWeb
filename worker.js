export class FlohState {
  constructor(state) { this.state = state; }
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/write") {
      const body = await request.text();
      if (body.length > 65536) return new Response("Payload too large", { status: 413 });
      await this.state.storage.put("snapshot", body);
      await this.state.storage.put("updatedAt", Date.now());
      return Response.json({ ok: true });
    }
    if (request.method === "GET" && url.pathname === "/read") {
      const snapshot = await this.state.storage.get("snapshot");
      const updatedAt = await this.state.storage.get("updatedAt");
      return Response.json({ connected: Boolean(snapshot), updatedAt: updatedAt || null, snapshot: snapshot ? JSON.parse(snapshot) : null }, {
        headers: { "Cache-Control": "no-store" }
      });
    }
    return new Response("Not found", { status: 404 });
  }
}

function authorized(request, expected) {
  const supplied = request.headers.get("Authorization") || "";
  return Boolean(expected) && supplied === "Bearer " + expected;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/heartbeat" && request.method === "POST") {
      if (!authorized(request, env.SERVER_TOKEN)) return new Response("Unauthorized", { status: 401 });
      const text = await request.text();
      if (text.length > 65536) return new Response("Payload too large", { status: 413 });
      let parsed;
      try { parsed = JSON.parse(text); } catch { return new Response("Invalid JSON", { status: 400 }); }
      if (!parsed || typeof parsed !== "object" || !parsed.server || typeof parsed.timestamp !== "number")
        return new Response("Invalid snapshot", { status: 400 });
      const id = env.FLOH_STATE.idFromName("main-server");
      const stub = env.FLOH_STATE.get(id);
      return stub.fetch("https://state/write", { method: "POST", body: JSON.stringify(parsed) });
    }
    if (url.pathname === "/api/state" && request.method === "GET") {
      if (!authorized(request, env.ADMIN_TOKEN)) return new Response("Unauthorized", { status: 401 });
      const id = env.FLOH_STATE.idFromName("main-server");
      const stub = env.FLOH_STATE.get(id);
      return stub.fetch("https://state/read");
    }
    if (url.pathname.startsWith("/api/")) return new Response("Not found", { status: 404 });
    return env.ASSETS.fetch(request);
  }
};