// Manage api
const api = {
  async get(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  },
  async post(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  },
  async del(url) {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  },
};
