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

class Notification extends Model
{
    use HasFactory;
    public $timestamps = false;

    protected $table = 'notification';

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function cause(): BelongsTo|Follow
    {
        if ($this->notificationtype == 'CommentNotification') {
            return $this->belongsTo(Comment::class, 'id_comment');
        } else if ( $this->notificationtype == 'LikedPost') {
            return $this->belongsTo(Reaction::class, 'id_reaction');
        } else if ( $this->notificationtype == 'NewFollower') {
            // make a belong to relationship with the follow table
            // follw table has a composite primary key : id_follower and id_followed
            // this notification has atrributes id_follower and id_user which refer to the follow table atrributes id_follower and id_followed respectively
            return $this->belongsTo(Follow::class, 'id_user', 'id_followed');
        }
    }

    public function comment(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'id_comment');
    }

    public function friendrequest(): BelongsTo
    {
        return $this->belongsTo(FriendRequest::class, 'id_friendrequestSender', 'id_user');
    }

    public function reaction(): BelongsTo
    {
        return $this->belongsTo(Reaction::class, 'id_reaction');
    }

    public function follower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_follower' , 'id_user'); // dont know if this is correct
    }

    

}
