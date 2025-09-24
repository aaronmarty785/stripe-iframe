<?php

use Illuminate\Support\Facades\Route;

Route::get('/pay', function () {
    return view('pay');
})->name('pay');
