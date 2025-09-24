<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Invoice Payment</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- Bootstrap (CDN) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Custom CSS -->
    <link href="{{ asset('assets/css/style.css') }}" rel="stylesheet" />

    <!-- Stripe.js -->
    <script src="https://js.stripe.com/v3/"></script>
</head>

<body>
    <div class="card shadow-sm">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <img class="brand" src="https://dummyimage.com/180x40/eee/333&text=Your+Logo" alt="Logo">
                <span class="text-muted">Secure Payment</span>
            </div>

            <h5 class="mb-3">Pay your invoice</h5>

            <!-- Form -->
            <form id="pay-form" class="needs-validation" novalidate>
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Invoice #</label>
                        <input id="invoice" name="invoice" class="form-control" maxlength="64" required
                            placeholder="INV-12345">
                        <div class="invalid-feedback">Invoice number is required.</div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Invoice Amount (USD)</label>
                        <input id="amount" name="amount" type="number" step="0.01" min="1"
                            class="form-control" required placeholder="250.00">
                        <div class="invalid-feedback">Enter a valid amount (min $1).</div>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label">Your Name (optional)</label>
                        <input id="customerName" name="customerName" class="form-control" maxlength="128"
                            placeholder="Jane Doe">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Email (optional)</label>
                        <input id="email" name="email" type="email" class="form-control" maxlength="128"
                            placeholder="you@example.com">
                    </div>

                    <div class="col-12">
                        <label class="form-label">Payment Method</label>
                        <div class="btn-group w-100" role="group">
                            <input type="radio" class="btn-check" name="method" id="methodCard" value="card"
                                autocomplete="off" checked>
                            <label class="btn btn-outline-primary" for="methodCard">Card</label>

                            <input type="radio" class="btn-check" name="method" id="methodAch" value="ach"
                                autocomplete="off">
                            <label class="btn btn-outline-primary" for="methodAch">ACH (Bank)</label>
                        </div>
                    </div>

                    <!-- Card Element -->
                    <div class="col-12" id="cardSection">
                        <label class="form-label mt-2">Card Details</label>
                        <div id="card-element" class="ElementsGroup"></div>
                    </div>

                    <!-- ACH helper text -->
                    <div class="col-12 hidden" id="achSection">
                        <div class="alert alert-info mt-2 mb-0">
                            You’ll securely link your bank with Stripe. ACH may show as <strong>processing</strong>
                            while funds settle.
                        </div>
                    </div>

                    <!-- Fee preview -->
                    <div class="col-12">
                        <div
                            class="sr-amount-preview d-flex justify-content-between align-items-center border rounded p-2 bg-light">
                            <div>
                                <div><small>Invoice amount:</small> <span class="num" id="netPreview">$0.00</span>
                                </div>
                                <div><small>Processing fee:</small> <span class="num" id="feePreview">$0.00</span>
                                </div>
                            </div>
                            <div class="text-end">
                                <div><small>Total charge:</small></div>
                                <div class="fs-5 fw-semibold" id="grossPreview">$0.00</div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 d-grid">
                        <button id="payBtn" type="submit" class="btn btn-primary btn-lg">
                            Pay securely
                        </button>
                    </div>
                </div>
            </form>

            <!-- Results -->
            <div id="result" class="mt-3"></div>
        </div>
    </div>

    <script type="module" src="{{ asset('assets/js/validations.js') }}"></script>
    <script type="module" src="{{ asset('assets/js/fee.js') }}"></script>
    <script type="module" src="{{ asset('assets/js/api-payment.js') }}"></script>
    <script type="module" src="{{ asset('assets/js/main.js') }}"></script>
</body>

</html>
