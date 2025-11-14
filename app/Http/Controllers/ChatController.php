<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Chat;
use App\Models\Agent;

class ChatController extends Controller
{
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

    public function getAgentChats(Agent $agent)
    {
        $chats = $agent->chats;

        return response()->json($chats);
    }
}
