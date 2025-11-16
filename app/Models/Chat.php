<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    protected $fillable = ['description', 'agent_id', 'user_id'];

    protected $appends = ['agent_name'];

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function getAgentNameAttribute()
    {
        return $this->agent ? $this->agent->name : null;
    }
}
