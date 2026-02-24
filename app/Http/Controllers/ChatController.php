<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function show(Request $request, Agent $agent, Chat $chat)
    {
        $user = auth()->user();

        if (! $user->agents->contains($agent->uuid)) {
            return abort(403);
        }

        if ($agent->uuid !== $chat->agent_uuid) {
            return abort(404);
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

        if (! $user->agents->contains($request->agent_uuid)) {
            return abort(403);
        }

        Chat::create([
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

        if (! $user->agents->contains($request->agent_uuid)) {
            return abort(403);
        }

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

        Cache::forget("chat_{$chat->uuid}_messages");
        Cache::forget("agent_{$request->agent_uuid}_chats");
        Cache::forget("user_{$user->id}_agents_with_chats");

        return redirect()->to(route('chats.show', [$request->agent_uuid, $chat->uuid]).'?newChat=true');
    }

    public function update(Request $request, Chat $chat)
    {
        $request->validate([
            'description' => 'nullable|string',
        ]);

        $user = auth()->user();

        if (! $user->chats->contains($chat->uuid)) {
            return abort(403);
        }

        $chat->update($request->all());

        Cache::forget("agent_{$chat->agent_uuid}_chats");
        Cache::forget("user_{$user->id}_agents_with_chats");

        return redirect()->back()->with('success', 'Chat updated successfully');
    }

    public function destroy(Chat $chat)
    {
        $user = auth()->user();

        if (! $user->agents->contains($chat->agent_uuid)) {
            return abort(403);
        }

        $agentUuid = $chat->agent_uuid;
        $chatUuid = $chat->uuid;

        $chat->delete();

        Cache::forget("chat_{$chatUuid}_messages");
        Cache::forget("agent_{$agentUuid}_chats");
        Cache::forget("user_{$user->id}_agents_with_chats");

        return redirect()->route('agents.show', $agentUuid)->with('success', 'Chat deleted successfully');
    }
}
