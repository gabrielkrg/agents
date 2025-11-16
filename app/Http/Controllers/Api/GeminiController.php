<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Models\Message;
use App\Models\Agent;

class GeminiController extends Controller
{
    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        return response()->json(['content' => 'Hello, ' . $request->content . '!']);
    }
}
