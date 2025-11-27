<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Agent;
use Illuminate\Container\Attributes\Auth;

class AgentController extends Controller
{
    public function index()
    {
        $agents = auth()->user()->agents;
        return Inertia::render('agents/index', [
            'agents' => $agents,
        ]);
    }

    public function show(Agent $agent)
    {
        $user = auth()->user();

        if (!$user->agents->contains($agent->uuid)) {
            return redirect()->back()->with('error', 'You are not authorized to view this agent');
        }

        $chats = $agent->chats()->orderByDesc('created_at')->get();

        return Inertia::render('agents/show', [
            'agent' => $agent,
            'chats' => $chats,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'json_schema' => 'nullable|json',
        ]);

        $agent = Agent::create([
            'name' => $request->name,
            'description' => $request->description,
            'json_schema' => $request->json_schema,
            'user_id' => auth()->user()->id,
        ]);

        return redirect()->route('agents.show', $agent)->with('success', 'Agent created successfully');
    }

    public function update(Request $request, Agent $agent)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'json_schema' => 'nullable|json',
        ]);

        // dd($request->all());

        $agent->update($request->all());

        return redirect()->back()->with('success', 'Agent updated successfully');
    }

    public function destroy(Agent $agent)
    {
        $agent->delete();

        return redirect()->route('dashboard')->with('success', 'Agent deleted successfully');
    }
}
