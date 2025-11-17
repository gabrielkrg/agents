<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Models\Agent;
use App\Models\Chat;
use App\Services\GeminiService;

class GeminiController extends Controller
{
    public function generate(Request $request, GeminiService $geminiService): JsonResponse
    {
        $request->validate([
            'agent_id' => 'required|exists:agents,id',
            'chat_id' => 'required|exists:chats,id',
        ]);

        $user = auth()->user();

        if (!$user->agents->contains($request->agent_id)) {
            return response()->json(['error' => 'You are not authorized to generate content for this agent'], 403);
        }

        if (!$user->chats->contains($request->chat_id)) {
            return response()->json(['error' => 'You are not authorized to generate content for this chat'], 403);
        }

        $agent = Agent::find($request->agent_id);
        $chat = Chat::find($request->chat_id);

        $response = $geminiService->generateContent($agent, $chat, $request);

        return response()->json($response);
    }
}
