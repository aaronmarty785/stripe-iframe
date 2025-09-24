<?php

namespace App\Http\Controllers;

use App\Support\Fee;
use Illuminate\Http\Request;
use Stripe\StripeClient;

class PaymentController extends Controller
{
    public function createIntent(Request $request)
    {
        $data = $request->validate([
            'invoice'      => ['required', 'string', 'max:64'],
            'amount'       => ['required', 'numeric', 'min:1'],
            'method'       => ['required', 'in:card,ach'],
            'customerName' => ['nullable', 'string', 'max:128'],
            'email'        => ['nullable', 'email', 'max:128'],
        ]);

        $pennies  = (int) round($data['amount'] * 100);
        if ($pennies <= 0) {
            return response()->json(['error' => 'Invalid amount'], 422);
        }

        $grossCents = $data['method'] === 'card'
            ? Fee::grossForCardCents($pennies)
            : Fee::grossForAchCents($pennies);

        $stripe = new StripeClient(config('stripe.secret'));

        $paymentMethodTypes = $data['method'] === 'card'
            ? ['card']
            : ['us_bank_account'];

        $achOptions = [
            'us_bank_account' => [
                'verification_method' => 'instant'
            ]
        ];

        $params = [
            'amount'               => $grossCents,
            'currency'             => config('stripe.currency', 'usd'),
            'payment_method_types' => $paymentMethodTypes,
            'metadata'             => [
                'invoice'     => $data['invoice'],
                'net_cents'   => $pennies,
                'gross_cents' => $grossCents,
                'method'      => $data['method'],
            ],
            'description'          => "Invoice {$data['invoice']}",
        ];

        if ($data['method'] === 'ach') {
            $params['payment_method_options'] = $achOptions;
        }

        $intent = $stripe->paymentIntents->create($params);

        return response()->json([
            'clientSecret' => $intent->client_secret,
            'gross'        => number_format($grossCents / 100, 2),
        ]);
    }
}
