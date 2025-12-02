<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Message;
use Illuminate\Support\Facades\Cache;
use App\Models\Chat;

class MessageController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'content' => 'required|string',
            'role' => 'required|in:user,model',
            'chat_uuid' => 'required|exists:chats,uuid',
            'agent_uuid' => 'required|exists:agents,uuid',
        ]);

        $user = auth()->user();

        if (!$user->chats->contains($request->chat_uuid)) {
            return response()->json(['error' => 'You are not authorized to create a message for this chat'], 403);
        }

        if (!$user->agents->contains($request->agent_uuid)) {
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
