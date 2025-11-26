<?php

use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\GeminiController;
use App\Http\Controllers\Api\AgentController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::post('/messages', [MessageController::class, 'store']);
    Route::post('/gemini/generate', [GeminiController::class, 'generate']);
    Route::post('/gemini/generate/stream', [GeminiController::class, 'generateStream']);
    Route::get('/agents', [AgentController::class, 'agents'])->name('api.agents');

    Route::get('/test', function () {
        return response()->json(['message' => 'Hello, world!']);
    });
});
