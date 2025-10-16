export function fmt(n) {
    return `$${Number(n).toFixed(2)}`;
}

export function calcGross(method, amount) {
    if (amount <= 0) return { fee: 0, gross: 0 };

    if (method === "card") {
        const percent = 0.029;
        const fixed = 0.3;
        const fee = +(amount * percent + fixed).toFixed(2);
        const net = +(amount - fee).toFixed(2);
        const gross = +(amount + fee).toFixed(2);
        return { fee, net, gross };
    } else {
        const pct = 0.008;
        const cap = 5.0;

        const grossUncapped = +(amount / (1 - pct)).toFixed(2);
        const feeUncapped = +(grossUncapped * pct).toFixed(2);

        if (feeUncapped <= cap) {
            return { fee: feeUncapped, gross: grossUncapped };
        }

        const grossCapped = +(amount + cap).toFixed(2);
        return { fee: cap, gross: grossCapped };
    }
}
