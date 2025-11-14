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

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
        ]);

        Agent::create([
            'name' => $request->name,
            'description' => $request->description,
            'user_id' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Agent created successfully');
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

        return redirect()->back()->with('success', 'Agent deleted successfully');
    }
}
