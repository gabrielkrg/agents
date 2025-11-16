<?php

use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\GeminiController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::post('/messages', [MessageController::class, 'store']);
    Route::post('/ai/generate', [GeminiController::class, 'generate']);
});
