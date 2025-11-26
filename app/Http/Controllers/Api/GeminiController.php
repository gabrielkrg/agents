<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Agent;
use App\Models\Chat;
use App\Services\GeminiService;

class GeminiController extends Controller
{
    public function generate(Request $request, GeminiService $geminiService): JsonResponse
    {
        $request->validate([
            'agent_uuid' => 'required|exists:agents,uuid',
            'chat_uuid' => 'required|exists:chats,uuid',
        ]);

        $user = auth()->user();

        if (!$user->agents->contains($request->agent_uuid)) {
            return response()->json(['error' => 'You are not authorized to generate content for this agent'], 403);
        }

        if (!$user->chats->contains($request->chat_uuid)) {
            return response()->json(['error' => 'You are not authorized to generate content for this chat'], 403);
        }

        $agent = Agent::find($request->agent_uuid);
        $chat = Chat::find($request->chat_uuid);

        $response = $geminiService->generateContent($agent, $chat, $request);

        $agent->increment('count');

        return response()->json($response);
    }

    public function generateSingle(Request $request, GeminiService $geminiService): JsonResponse
    {
        $request->validate([
            'agent_uuid' => 'nullable|exists:agents,uuid',
            'content' => 'required|string',
        ]);

        $user = auth()->user();

        $agent = $request->agent_uuid ? Agent::find($request->agent_uuid) : null;

        $response = $geminiService->generateContentSingle($agent, $request);

        // $agent->increment('count');

        return response()->json($response);
    }
}
