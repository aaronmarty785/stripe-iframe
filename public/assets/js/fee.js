export function fmt(n) {
    return `$${Number(n).toFixed(2)}`;
}

export function calcGross(method, net) {
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
