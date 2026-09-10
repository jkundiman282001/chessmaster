<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GameController;

// Public Auth Endpoints
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Player Endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard Hub
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Game Room Management & Matchmaking
    Route::post('/games', [GameController::class, 'store']);
    Route::post('/games/join', [GameController::class, 'join']);
    Route::get('/games/{code}', [GameController::class, 'show']);
});

Route::get('/health', function () {
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Throwable $e) {
        $dbStatus = 'disconnected: ' . $e->getMessage();
    }

    return response()->json([
        'status' => 'healthy',
        'service' => 'chessmaster-api',
        'database' => $dbStatus,
        'broadcasting' => config('broadcasting.default'),
        'timestamp' => now()->toIso8601String(),
    ]);
});

