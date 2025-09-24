<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/payment-intents', [PaymentController::class, 'createIntent']);
