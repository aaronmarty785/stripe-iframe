const STRIPE_PK = "{{ config('stripe.publishable') }}";
const API_URL = "{{ url('/api/payment-intents') }}";

const stripe = Stripe(STRIPE_PK);
const elements = stripe.elements();

const cardElement = elements.create("card", { hidePostalCode: true });
cardElement.mount("#card-element");

const form = document.getElementById("pay-form");
const payBtn = document.getElementById("payBtn");
const methodCard = document.getElementById("methodCard");
const methodAch = document.getElementById("methodAch");
const cardSection = document.getElementById("cardSection");
const achSection = document.getElementById("achSection");
const resultDiv = document.getElementById("result");

const amountInput = document.getElementById("amount");
const netPreview = document.getElementById("netPreview");
const feePreview = document.getElementById("feePreview");
const grossPreview = document.getElementById("grossPreview");

function fmt(n) {
    return `$${Number(n).toFixed(2)}`;
}

function calcGross(method, net) {
    const cents = Math.round(net * 100);
    if (cents <= 0) return { fee: 0, gross: 0 };
    if (method === "card") {
        const percent = 0.029,
            fixed = 30;
        const gross = Math.ceil((cents + fixed) / (1 - percent));
        const fee = gross - cents;
        return { fee: fee / 100, gross: gross / 100 };
    } else {
        const pct = 0.008,
            cap = 500;
        const grossUncapped = Math.ceil(cents / (1 - pct));
        const feeUncapped = Math.ceil(grossUncapped * pct);
        if (feeUncapped <= cap) {
            return { fee: feeUncapped / 100, gross: grossUncapped / 100 };
        }
        return { fee: cap / 100, gross: (cents + cap) / 100 };
    }
}

function updatePreview() {
    const net = Number(amountInput.value || 0);
    const method = methodCard.checked ? "card" : "ach";
    const { fee, gross } = calcGross(method, net);
    netPreview.textContent = fmt(net);
    feePreview.textContent = fmt(fee);
    grossPreview.textContent = fmt(gross);
}

amountInput.addEventListener("input", updatePreview);
methodCard.addEventListener("change", () => {
    cardSection.classList.remove("hidden");
    achSection.classList.add("hidden");
    updatePreview();
});
methodAch.addEventListener("change", () => {
    cardSection.classList.add("hidden");
    achSection.classList.remove("hidden");
    updatePreview();
});

updatePreview();

function validateForm() {
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return false;
    }
    return true;
}

async function createIntent(payload) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
}

function showMessage(html, ok = false) {
    resultDiv.className = ok ? "alert alert-success" : "alert alert-danger";
    resultDiv.innerHTML = html;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    resultDiv.className = "";
    resultDiv.innerHTML = "";

    if (!validateForm()) return;

    const payload = {
        invoice: document.getElementById("invoice").value.trim(),
        amount: Number(amountInput.value || 0),
        method: methodCard.checked ? "card" : "ach",
        customerName: document.getElementById("customerName").value.trim(),
        email: document.getElementById("email").value.trim(),
    };

    if (payload.amount <= 0) {
        showMessage("Please enter a valid amount.");
        return;
    }

    payBtn.disabled = true;
    payBtn.textContent = "Processing...";

    try {
        const { clientSecret } = await createIntent(payload);

        if (payload.method === "card") {
            const { paymentIntent, error } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: payload.customerName || undefined,
                            email: payload.email || undefined,
                        },
                    },
                }
            );

            if (error) throw error;
            if (paymentIntent.status === "succeeded") {
                showMessage("Payment successful. Thank you!", true);
            } else if (paymentIntent.status === "processing") {
                showMessage(
                    "Payment received and is processing. You will receive a confirmation shortly.",
                    true
                );
            } else {
                showMessage(
                    `Status: ${paymentIntent.status}. If this persists, contact support.`
                );
            }
        } else {
            const collect = await stripe.collectBankAccountForPayment({
                clientSecret,
                params: {
                    payment_method_type: "us_bank_account",
                    payment_method_data: {
                        billing_details: {
                            name: payload.customerName || undefined,
                            email: payload.email || undefined,
                        },
                    },
                },
            });
            if (collect.error) throw collect.error;

            const confirm = await stripe.confirmUsBankAccountPayment(
                clientSecret
            );
            if (confirm.error) throw confirm.error;

            const status = confirm.paymentIntent.status;
            if (status === "succeeded") {
                showMessage("ACH payment successful. Thank you!", true);
            } else if (
                status === "processing" ||
                status === "requires_confirmation"
            ) {
                showMessage(
                    "Bank payment initiated. It may show as processing until it settles.",
                    true
                );
            } else {
                showMessage(
                    `Status: ${status}. If this persists, contact support.`
                );
            }
        }
    } catch (err) {
        const msg = err?.message || err?.error || "Payment failed.";
        showMessage(msg);
    } finally {
        payBtn.disabled = false;
        payBtn.textContent = "Pay securely";
    }
});
