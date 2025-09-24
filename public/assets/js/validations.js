export function validateForm(formEl) {
    if (!formEl.checkValidity()) {
        formEl.classList.add("was-validated");
        return false;
    }
    return true;
}

export function requirePositiveAmount(inputEl) {
    const val = Number(inputEl.value || 0);
    if (val <= 0) {
        inputEl.setCustomValidity("Please enter an amount greater than 0.");
    } else {
        inputEl.setCustomValidity("");
    }
}
