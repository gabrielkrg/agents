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

        if (!$user->agents->contains($agent->id)) {
            return redirect()->back()->with('error', 'You are not authorized to view this agent');
        }

        return Inertia::render('agents/show', [
            'agent' => $agent,
            'chats' => $agent->chats,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
        ]);

        $agent = Agent::create([
            'name' => $request->name,
            'description' => $request->description,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('agents.show', $agent->id)->with('success', 'Agent created successfully');
    }

    public function update(Request $request, Agent $agent)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
        ]);

        $agent->update($request->all());

        return redirect()->back()->with('success', 'Agent updated successfully');
    }

    public function destroy(Agent $agent)
    {
        $agent->delete();

        return redirect()->route('dashboard')->with('success', 'Agent deleted successfully');
    }
}
