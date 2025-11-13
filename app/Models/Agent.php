<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agent extends Model
{
    protected $fillable = ['name', 'description', 'user_id', 'count'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
