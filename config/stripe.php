<?php

return [
    'secret'       => env('STRIPE_SECRET'),
    'publishable'  => env('STRIPE_PUBLISHABLE'),
    'currency'     => env('CURRENCY', 'usd'),
];
