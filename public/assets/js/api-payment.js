export async function createPaymentIntent(apiUrl, payload, extraHeaders = {}) {
    const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            ...extraHeaders,
        },
        body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
}
