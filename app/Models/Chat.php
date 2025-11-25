<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Chat extends Model
{
    use HasUuids;
    protected $primaryKey = 'uuid';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['description', 'agent_uuid', 'user_id'];

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
