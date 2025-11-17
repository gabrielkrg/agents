<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class AgentController extends Controller
{
    public function agents(): JsonResponse
    {
        $user = auth()->user();
        $agents = $user->agents()->with('chats')->orderBy('created_at', 'desc')->get();

        return response()->json($agents);
    }
}
