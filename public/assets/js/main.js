import { createPaymentIntent } from "./api.js";
import { validateForm, requirePositiveAmount } from "./validation.js";
import { calcGross, fmt } from "./fees.js";

(function () {
    const { STRIPE_PK, API_URL } = window.PAYCONF || {};
    if (!STRIPE_PK || !API_URL) {
        console.error(
            "Missing Stripe publishable key or API URL in window.PAYCONF."
        );
        return;
    }

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

    function showMessage(html, ok = false) {
        resultDiv.className = ok ? "alert alert-success" : "alert alert-danger";
        resultDiv.innerHTML = html;
    }

    function updatePreview() {
        const net = Number(amountInput.value || 0);
        const method = methodCard.checked ? "card" : "ach";
        const { fee, gross } = calcGross(method, net);
        netPreview.textContent = fmt(net);
        feePreview.textContent = fmt(fee);
        grossPreview.textContent = fmt(gross);
    }

    amountInput.addEventListener("input", () => {
        requirePositiveAmount(amountInput);
        updatePreview();
    });

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

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        resultDiv.className = "";
        resultDiv.innerHTML = "";

        if (!validateForm(form)) return;

        const payload = {
            invoice: document.getElementById("invoice").value.trim(),
            amount: Number(amountInput.value || 0),
            method: methodCard.checked ? "card" : "ach",
            customerName: document.getElementById("customerName").value.trim(),
            email: document.getElementById("email").value.trim(),
        };

        if (payload.amount <= 0) {
            showMessage("Please enter a valid amount greater than 0.");
            return;
        }

        payBtn.disabled = true;
        payBtn.textContent = "Processing...";

        try {
            const { clientSecret } = await createPaymentIntent(
                API_URL,
                payload
            );

            if (payload.method === "card") {
                const { paymentIntent, error } =
                    await stripe.confirmCardPayment(clientSecret, {
                        payment_method: {
                            card: cardElement,
                            billing_details: {
                                name: payload.customerName || undefined,
                                email: payload.email || undefined,
                            },
                        },
                    });

                if (error) throw error;
                const status = paymentIntent.status;
                if (status === "succeeded") {
                    showMessage("Payment successful. Thank you!", true);
                } else if (status === "processing") {
                    showMessage(
                        "Payment received and is processing. You will receive a confirmation shortly.",
                        true
                    );
                } else {
                    showMessage(
                        `Status: ${status}. If this persists, contact support.`
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
})();
