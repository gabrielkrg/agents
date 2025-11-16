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
    public function index(Agent $agent)
    {
        $user = auth()->user();

        if (!$user->agents->contains($agent->id)) {
            return redirect()->back()->with('error', 'You are not authorized to view this chat');
        }

        $chats = $agent->chats()->with('agent')->get();

        return Inertia::render('chats/index', [
            'chats' => $chats,
        ]);
    }

    public function show(Chat $chat)
    {
        $user = auth()->user();

        if (!$user->agents->contains($chat->agent_id)) {
            return redirect()->back()->with('error', 'You are not authorized to view this chat');
        }

        $chat->load('agent');

        return Inertia::render('chats/show', [
            'chat' => $chat,
            'messages' => $chat->messages,
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
                'description' => 'New chat ' . $request->content,
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

        return Inertia::render('chats/show', [
            'chat' => $chat,
            'messages' => $chat->messages,
            'newChat' => true,
        ]);
    }
}
