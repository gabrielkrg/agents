<?php

use App\Models\Chat;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{chatUuid}', function (?\Illuminate\Contracts\Auth\Authenticatable $user, string $chatUuid) {
    if (! $user) {
        return false;
    }
    $chat = Chat::where('uuid', $chatUuid)->first();

    return $chat && $chat->user_id === $user->id;
});
