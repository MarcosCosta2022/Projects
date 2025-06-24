<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Model;


// Added to define Eloquent relationships.
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    use HasFactory;
    public $timestamps = false;

    protected $table = 'report';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'id_post');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function allReports(){
        return $this->all();
    }

    public function countReports(){
        return $this->all()->count();
    }

}
