<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $agents = $user->agents()->orderByDesc('created_at')->with('chats')->get();

        return Inertia::render('dashboard', compact('agents'));
    }
}
