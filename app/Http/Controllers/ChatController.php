<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Chat;
use App\Models\Agent;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Message;
use Illuminate\Support\Facades\Cache;

class ChatController extends Controller
{
    public function show(Request $request, Agent $agent, Chat $chat)
    {
        $user = auth()->user();

        if (!$user->chats->contains($chat->uuid)) {
            return redirect()->back()->with('error', 'You are not authorized to view this chat');
        }

        if ($agent->uuid !== $chat->agent_uuid) {
            return redirect()->back()->with('error', 'Something went wrong');
        }

        $chat->load('agent');

        // Cache apenas para chats com muitas mensagens (>50)
        $messageCount = $chat->messages()->count();
        $cacheKey = "chat_{$chat->uuid}_messages";

        if ($messageCount > 50) {
            $messages = Cache::remember($cacheKey, now()->addMinutes(2), function () use ($chat) {
                return $chat->messages;
            });
        } else {
            $messages = $chat->messages;
        }

        return Inertia::render('chats/show', [
            'chat' => $chat,
            'messages' => $messages,
            'newChat' => $request->query('newChat'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'description' => 'nullable|string',
            'agent_uuid' => 'required|exists:agents,uuid',
        ]);

        $user = auth()->user();

        if (!$user->agents->contains($request->agent_uuid)) {
            return redirect()->back()->with('error', 'You are not authorized to create a chat for this agent');
        }

        $chat = Chat::create([
            'description' => $request->description,
            'agent_uuid' => $request->agent_uuid,
            'user_id' => $user->id,
        ]);

        // Invalidar cache de chats do agente
        Cache::forget("agent_{$request->agent_uuid}_chats");
        // Invalidar cache de agents do usuário
        Cache::forget("user_{$user->id}_agents_with_chats");

        return redirect()->back()->with('success', 'Chat created successfully');
    }

    public function storeWithMessage(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'agent_uuid' => 'required|exists:agents,uuid',
        ]);


        $user = auth()->user();

        if (!$user->agents->contains($request->agent_uuid)) {
            return redirect()->back()->with('error', 'You are not authorized to create a chat for this agent');
        }

        // 
        $cleanContent = trim(strip_tags($request->content));
        $description = mb_substr($cleanContent, 0, 20);

        if (mb_strlen($cleanContent) > 20) {
            $description .= '...';
        }

        DB::beginTransaction();

        try {
            $chat = Chat::create([
                'description' => $description,
                'agent_uuid' => $request->agent_uuid,
                'user_id' => $user->id,
            ]);

            Message::create([
                'chat_uuid' => $chat->uuid,
                'user_id' => $user->id,
                'content' => $request->content,
                'role' => 'user',
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }

        DB::commit();

        // Invalidar cache de mensagens do chat
        Cache::forget("chat_{$chat->uuid}_messages");
        // Invalidar cache de chats do agente
        Cache::forget("agent_{$request->agent_uuid}_chats");
        // Invalidar cache de agents do usuário
        Cache::forget("user_{$user->id}_agents_with_chats");

        return redirect()->to(route('chats.show', [$request->agent_uuid, $chat->uuid]) . '?newChat=true');
    }

    public function update(Request $request, Chat $chat)
    {
        $request->validate([
            'description' => 'nullable|string',
        ]);

        $user = auth()->user();

        if (!$user->chats->contains($chat->uuid)) {
            return redirect()->back()->with('error', 'You are not authorized to update this chat');
        }

        $chat->update($request->all());

        // Invalidar cache de chats do agente
        Cache::forget("agent_{$chat->agent_uuid}_chats");
        // Invalidar cache de agents do usuário
        Cache::forget("user_{$user->id}_agents_with_chats");

        return redirect()->back()->with('success', 'Chat updated successfully');
    }

    public function destroy(Chat $chat)
    {
        $user = auth()->user();

        if (!$user->agents->contains($chat->agent_uuid)) {
            return redirect()->back()->with('error', 'You are not authorized to delete this chat');
        }

        $agentUuid = $chat->agent_uuid;
        $chatUuid = $chat->uuid;

        $chat->delete();

        // Invalidar cache de mensagens do chat
        Cache::forget("chat_{$chatUuid}_messages");
        // Invalidar cache de chats do agente
        Cache::forget("agent_{$agentUuid}_chats");
        // Invalidar cache de agents do usuário
        Cache::forget("user_{$user->id}_agents_with_chats");

        return redirect()->route('agents.show', $agentUuid)->with('success', 'Chat deleted successfully');
    }
}
