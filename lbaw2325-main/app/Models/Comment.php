<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Post;
// Added to define Eloquent relationships.
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends Model
{
    use HasFactory;


    protected $table = 'comment';

    protected $fillable = [
        'id_post',
        'id_user',
        'content',
        'created_at',
    ];   
    // Don't add create and update timestamps in database.
    public $timestamps  = false;

    /**
     * Get the card where the item is included.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class , 'id_post');
    }

    /**
     * Get the user who created the item.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user');
    }


    /**
     * Get the reactions for the comment.
     */
    public function reactions(): HasMany
    {
        return $this->hasMany(Reaction::class , 'id_comment')->where('reactiontype', 'ReactionComment');
    }

    /**
     * Get the likes for the comment.
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Reaction::class , 'id_comment')->where('liked', true);
    }

    /**
     * Get the dislikes for the comment.
     */
    public function dislikes(): HasMany
    {
        return $this->hasMany(Reaction::class , 'id_comment')->where('liked', false);
    }

    public function orderByLikes()
    {
        return $this->likes()->count();
    }
    
    public function notifications(){
        return $this->hasMany(Notification::class, 'id_comment')->where('notificationtype', 'CommentNotification');
    }

    public function remove()
    {
        $this->notifications()->delete();
        $reactions= $this->reactions();
        foreach($reactions as $reaction){ 
            $reaction->notification()->delete();
            $reaction->delete();
        }
        $this->delete();
    }


}
