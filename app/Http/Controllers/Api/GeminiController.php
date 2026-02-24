<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateGeminiResponseJob;
use App\Models\Agent;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeminiController extends Controller
{
    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'agent_uuid' => 'required|exists:agents,uuid',
            'chat_uuid' => 'required|exists:chats,uuid',
        ]);

        $user = auth()->user();

        if (! $user->agents->pluck('uuid')->contains($request->agent_uuid)) {
            return response()->json(['error' => 'You are not authorized to generate content for this agent'], 403);
        }

        if (! $user->chats->pluck('uuid')->contains($request->chat_uuid)) {
            return response()->json(['error' => 'You are not authorized to generate content for this chat'], 403);
        }

        GenerateGeminiResponseJob::dispatch(
            $request->agent_uuid,
            $request->chat_uuid,
            $user->id
        );

        return response()->json(['queued' => true], 202);
    }

    public function generateSingle(Request $request, GeminiService $geminiService): JsonResponse
    {
        $request->validate([
            'agent_uuid' => 'nullable|exists:agents,uuid',
            'content' => 'required|string',
        ]);

        $agent = $request->agent_uuid ? Agent::find($request->agent_uuid) : null;

        if ($agent && ! auth()->user()->agents->pluck('uuid')->contains($agent->uuid)) {
            return response()->json(['error' => 'You are not authorized to generate content for this agent'], 403);
        }

        $response = $geminiService->generateContentSingle($agent, $request);

        $agent?->increment('count');

        return response()->json($response);
    }
}
