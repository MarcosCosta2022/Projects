<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;



// Added to define Eloquent relationships.
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Follow extends Model
{
    use HasFactory;

    
    protected $table = 'follow';

    protected $fillable = [
        'followstate',
        'created_at',
        'id_follower',
        'id_followed',
    ];

    protected $primaryKey = ['id_follower', 'id_followed'];
    protected $keyType = 'int'; // or 'string' depending on the data type
    public $incrementing = false;

    // Don't add create and update timestamps in database.
    public $timestamps  = false;

    /**
     * Get the user who sent the friend request.
     */
    public function follower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_follower');
    }

    /**
     * Get the user who received the friend request.
     */
    public function followed(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_followed');
    }
    public function index()
    {
        $userId = Auth::id();

        // Fetch mutual follows
        $mutualFollows = DB::table('follow AS f1')
            ->join('follow AS f2', function ($join) {
                $join->on('f1.id_follower', '=', 'f2.id_followed')
                     ->on('f2.id_follower', '=', 'f1.id_followed');
            })
            ->join('users', 'users.id', '=', 'f1.id_followed')
            ->where('f1.id_follower', $userId)
            ->where('f2.id_followed', $userId)
            ->select('users.id', 'users.username', 'users.img')
            ->get();

        return view('feed', ['mutualFollows' => $mutualFollows]);
    }
}

?>
