<?php

use App\Http\Controllers\AgentController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Agents
    Route::get('agents', [AgentController::class, 'index'])->name('agents.index');
    Route::get('a/{agent}', [AgentController::class, 'show'])->name('agents.show');
    Route::post('agents', [AgentController::class, 'store'])->name('agents.store');
    Route::put('agents/{agent}', [AgentController::class, 'update'])->name('agents.update');
    Route::delete('agents/{agent}', [AgentController::class, 'destroy'])->name('agents.destroy');

    // Chats
    Route::get('a/{agent}/c/{chat}', [ChatController::class, 'show'])->name('chats.show');

    Route::put('chats/{chat}', [ChatController::class, 'update'])->name('chats.update');
    Route::post('chats', [ChatController::class, 'storeWithMessage'])->name('chats.storeWithMessage');
    Route::delete('chats/{chat}', [ChatController::class, 'destroy'])->name('chats.destroy');
});

require __DIR__ . '/settings.php';
