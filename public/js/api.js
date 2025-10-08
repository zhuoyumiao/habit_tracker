// Manage api
const api = {
  get: async (url) => {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  },
  post: async (url, body) => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  },
  del: async (url) => {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  },
};

export default api;
