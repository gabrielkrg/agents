<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MessageController extends Controller
{
    public function index(string $chat_uuid): JsonResponse
    {
        $user = auth()->user();

        if (! $user->chats->pluck('uuid')->contains($chat_uuid)) {
            return response()->json(['error' => 'You are not authorized to view messages for this chat'], 403);
        }

        $messages = Message::where('chat_uuid', $chat_uuid)
            ->orderBy('created_at')
            ->get(['uuid', 'role', 'content', 'created_at']);

        return response()->json($messages);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'content' => 'required|string',
            'role' => 'required|in:user,model',
            'chat_uuid' => 'required|exists:chats,uuid',
            'agent_uuid' => 'required|exists:agents,uuid',
        ]);

        $user = auth()->user();

        if (! $user->chats->pluck('uuid')->contains($request->chat_uuid)) {
            return response()->json(['error' => 'You are not authorized to create a message for this chat'], 403);
        }

        if (! $user->agents->pluck('uuid')->contains($request->agent_uuid)) {
            return response()->json(['error' => 'You are not authorized to create a message for this agent'], 403);
        }

        $message = Message::create([
            'content' => $request->content,
            'role' => $request->role,
            'chat_uuid' => $request->chat_uuid,
            'user_id' => $user->id,
        ]);

        // Invalidar cache de mensagens do chat
        Cache::forget("chat_{$request->chat_uuid}_messages");

        // Invalidar cache de chats do agente
        $chat = Chat::find($request->chat_uuid);
        if ($chat) {
            Cache::forget("agent_{$chat->agent_uuid}_chats");
        }

        // Invalidar cache de agents do usuário
        Cache::forget("user_{$user->id}_agents_with_chats");

        return response()->json($message);
    }
}
