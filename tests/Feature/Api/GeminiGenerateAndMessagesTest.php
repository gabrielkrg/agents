<?php

use App\Jobs\GenerateGeminiResponseJob;
use App\Models\Agent;
use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use App\Services\GeminiService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

test('POST api gemini generate returns 202 and enqueues job', function () {
    Queue::fake();

    $user = User::factory()->create();
    $agent = Agent::create([
        'name' => 'Test Agent',
        'description' => 'Test',
        'user_id' => $user->id,
    ]);
    $chat = Chat::create([
        'description' => 'Test Chat',
        'agent_uuid' => $agent->uuid,
        'user_id' => $user->id,
    ]);

    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withHeader('Authorization', 'Bearer '.$token)
        ->postJson('/api/gemini/generate', [
            'agent_uuid' => $agent->uuid,
            'chat_uuid' => $chat->uuid,
        ]);

    $response->assertStatus(202);
    $response->assertJson(['queued' => true]);

    Queue::assertPushed(GenerateGeminiResponseJob::class);
});

test('generate gemini response job creates model message and invalidates caches', function () {
    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => 'Hello from Gemini'],
                        ],
                    ],
                ],
            ],
        ], 200),
    ]);

    $user = User::factory()->create();
    $agent = Agent::create([
        'name' => 'Test Agent',
        'description' => 'Test',
        'user_id' => $user->id,
    ]);
    $chat = Chat::create([
        'description' => 'Test Chat',
        'agent_uuid' => $agent->uuid,
        'user_id' => $user->id,
    ]);

    $this->assertDatabaseCount('messages', 0);

    $job = new GenerateGeminiResponseJob($agent->uuid, $chat->uuid, $user->id);
    $job->handle(app(GeminiService::class));

    $this->assertDatabaseCount('messages', 1);
    $message = Message::where('chat_uuid', $chat->uuid)->where('role', 'model')->first();
    expect($message)->not->toBeNull();
    expect($message->content)->toBe('Hello from Gemini');
});

test('GET api chats chat_uuid messages returns only that chat messages for authenticated user', function () {
    $user = User::factory()->create();
    $agent = Agent::create([
        'name' => 'Test Agent',
        'description' => 'Test',
        'user_id' => $user->id,
    ]);
    $chat = Chat::create([
        'description' => 'Test Chat',
        'agent_uuid' => $agent->uuid,
        'user_id' => $user->id,
    ]);
    $messages = [
        Message::create([
            'content' => 'First',
            'role' => 'user',
            'chat_uuid' => $chat->uuid,
            'user_id' => $user->id,
        ]),
        Message::create([
            'content' => 'Second',
            'role' => 'model',
            'chat_uuid' => $chat->uuid,
            'user_id' => $user->id,
        ]),
    ];

    $otherUser = User::factory()->create();
    $otherAgent = Agent::create([
        'name' => 'Other Agent',
        'description' => 'Other',
        'user_id' => $otherUser->id,
    ]);
    $otherChat = Chat::create([
        'description' => 'Other Chat',
        'agent_uuid' => $otherAgent->uuid,
        'user_id' => $otherUser->id,
    ]);

    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withHeader('Authorization', 'Bearer '.$token)
        ->getJson("/api/chats/{$chat->uuid}/messages");

    $response->assertSuccessful();
    $response->assertJsonCount(2);
    $response->assertJsonFragment(['content' => 'First', 'role' => 'user']);
    $response->assertJsonFragment(['content' => 'Second', 'role' => 'model']);
});

test('GET api chats chat_uuid messages returns 403 for another users chat', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $otherAgent = Agent::create([
        'name' => 'Other Agent',
        'description' => 'Other',
        'user_id' => $otherUser->id,
    ]);
    $otherChat = Chat::create([
        'description' => 'Other Chat',
        'agent_uuid' => $otherAgent->uuid,
        'user_id' => $otherUser->id,
    ]);

    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withHeader('Authorization', 'Bearer '.$token)
        ->getJson("/api/chats/{$otherChat->uuid}/messages");

    $response->assertForbidden();
});
