<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Chat;
use App\Models\Agent;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Message;

class ChatController extends Controller
{
    public function show(Request $request, Agent $agent, Chat $chat)
    {
        $user = auth()->user();

        if (!$user->chats->contains($chat->id)) {
            return redirect()->back()->with('error', 'You are not authorized to view this chat');
        }

        if ($agent->id !== $chat->agent_id) {
            return redirect()->back()->with('error', 'Something went wrong');
        }

        $chat->load('agent');

        return Inertia::render('chats/show', [
            'chat' => $chat,
            'messages' => $chat->messages,
            'newChat' => $request->query('newChat'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'description' => 'nullable|string',
            'agent_id' => 'required|exists:agents,id',
        ]);

        $user = auth()->user();

        if (!$user->agents->contains($request->agent_id)) {
            return redirect()->back()->with('error', 'You are not authorized to create a chat for this agent');
        }

        Chat::create([
            'description' => $request->description,
            'agent_id' => $request->agent_id,
            'user_id' => $user->id,
        ]);

        return redirect()->back()->with('success', 'Chat created successfully');
    }

    public function storeWithMessage(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'agent_id' => 'required|exists:agents,id',
        ]);

        $user = auth()->user();

        if (!$user->agents->contains($request->agent_id)) {
            return redirect()->back()->with('error', 'You are not authorized to create a chat for this agent');
        }

        DB::beginTransaction();

        try {
            $chat = Chat::create([
                'description' => $request->content,
                'agent_id' => $request->agent_id,
                'user_id' => $user->id,
            ]);

            Message::create([
                'chat_id' => $chat->id,
                'user_id' => $user->id,
                'content' => $request->content,
                'role' => 'user',
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }

        DB::commit();

        return redirect()->to(route('chats.show', [$request->agent_id, $chat->id]) . '?newChat=true');
    }

    public function update(Request $request, Chat $chat)
    {
        $request->validate([
            'description' => 'nullable|string',
        ]);

        $user = auth()->user();

        if (!$user->chats->contains($chat->id)) {
            return redirect()->back()->with('error', 'You are not authorized to update this chat');
        }

        $chat->update($request->all());

        return redirect()->back()->with('success', 'Chat updated successfully');
    }

    public function destroy(Chat $chat)
    {
        $user = auth()->user();

        if (!$user->agents->contains($chat->agent_id)) {
            return redirect()->back()->with('error', 'You are not authorized to delete this chat');
        }

        $chat->delete();

        return redirect()->route('agents.show', $chat->agent_id)->with('success', 'Chat deleted successfully');
    }
}
