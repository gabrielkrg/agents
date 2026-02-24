<?php

namespace App\Jobs;

use App\Models\Agent;
use App\Models\Chat;
use App\Models\Message;
use App\Services\GeminiService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class GenerateGeminiResponseJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $agentUuid,
        public string $chatUuid,
        public int $userId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(GeminiService $geminiService): void
    {
        $agent = Agent::where('uuid', $this->agentUuid)->first();
        $chat = Chat::where('uuid', $this->chatUuid)->first();

        if (! $agent || ! $chat) {
            return;
        }

        if ($chat->user_id !== $this->userId || $agent->user_id !== $this->userId) {
            return;
        }

        $request = new Request;

        $response = $geminiService->generateContent($agent, $chat, $request);

        Message::create([
            'content' => $response['raw'],
            'role' => 'model',
            'chat_uuid' => $this->chatUuid,
            'user_id' => $this->userId,
        ]);

        Cache::forget("chat_{$this->chatUuid}_messages");
        Cache::forget("agent_{$agent->uuid}_chats");
        Cache::forget("user_{$this->userId}_agents_with_chats");

        $agent->increment('count');
    }
}
