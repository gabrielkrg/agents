<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;
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

    public function generateStream(Request $request, GeminiService $geminiService): StreamedResponse|JsonResponse
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $response = $geminiService->generateContentStream($request);

        return response()->stream(function () use ($response) {
            while (ob_get_level() > 0) {
                ob_end_flush();
            }


            while (!empty($response)) {
                echo $response;
                flush();
            }

            echo "event: done\ndata: end\n\n";
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
