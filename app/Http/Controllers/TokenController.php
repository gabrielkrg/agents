<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class TokenController extends Controller
{
    public function index()
    {
        $tokens = auth()->user()->tokens;

        return Inertia::render('settings/tokens', [
            'tokens' => $tokens,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $token = $request->user()->createToken($request->name);

        return response()->json($token->plainTextToken);
    }

    public function destroy(Request $request, string $id)
    {
        $request->user()->tokens()->where('id', $id)->delete();

        return redirect()->back()->with('success', 'Token deleted successfully');
    }
}
