<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Message;

class MessageController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'content' => 'required|string',
            'role' => 'required|in:user,model',
            'chat_id' => 'required|exists:chats,id',
            'agent_id' => 'required|exists:agents,id',
        ]);

        $user = auth()->user();

        if (!$user->chats->contains($request->chat_id)) {
            return response()->json(['error' => 'You are not authorized to create a message for this chat'], 403);
        }

        if (!$user->agents->contains($request->agent_id)) {
            return response()->json(['error' => 'You are not authorized to create a message for this agent'], 403);
        }

        $message = Message::create([
            'content' => $request->content,
            'role' => $request->role,
            'chat_id' => $request->chat_id,
            'user_id' => $user->id,
        ]);

        return response()->json($message);
    }
}
