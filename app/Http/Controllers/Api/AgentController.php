<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class AgentController extends Controller
{
    public function agents(): JsonResponse
    {
        $user = auth()->user();

        $agents = $user->agents()
            ->with([
                'chats' => function ($query) {
                    $query->orderByDesc('created_at')->limit(10);
                },
            ])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json($agents);
    }
}
