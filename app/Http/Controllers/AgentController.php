<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Agent;
use Illuminate\Container\Attributes\Auth;
use Illuminate\Support\Facades\Cache;

class AgentController extends Controller
{
    public function index()
    {
        $agents = auth()->user()->agents()->orderByDesc('created_at')->with('chats')->get();

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

        $cacheKey = "agent_{$agent->uuid}_chats";
        $chats = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($agent) {
            return $agent->chats()->orderByDesc('created_at')->get();
        });

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

        $user = auth()->user();
        $agent = Agent::create([
            'name' => $request->name,
            'description' => $request->description,
            'json_schema' => $request->json_schema,
            'user_id' => $user->id,
        ]);

        // Invalidar cache de agents do usuário
        Cache::forget("user_{$user->id}_agents_with_chats");

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

        $user = auth()->user();
        $agent->update($request->all());

        // Invalidar cache de agents do usuário
        Cache::forget("user_{$user->id}_agents_with_chats");
        // Invalidar cache de chats do agente
        Cache::forget("agent_{$agent->uuid}_chats");

        return redirect()->back()->with('success', 'Agent updated successfully');
    }

    public function destroy(Agent $agent)
    {
        $user = auth()->user();
        $agentUuid = $agent->uuid;

        $agent->delete();

        // Invalidar cache de agents do usuário
        Cache::forget("user_{$user->id}_agents_with_chats");
        // Invalidar cache de chats do agente
        Cache::forget("agent_{$agentUuid}_chats");

        return redirect()->route('dashboard')->with('success', 'Agent deleted successfully');
    }
}
