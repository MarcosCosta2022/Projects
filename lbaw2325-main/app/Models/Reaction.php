<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// Added to define Eloquent relationships.
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reaction extends Model
{
    use HasFactory;

    protected $table = 'reaction';
    // Don't add create and update timestamps in database.
    public $timestamps  = false;

    /**
     * Get the user who created the reaction.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    /**
     * Get the post/comment where the reaction is included.
     */
    public function place(): BelongsTo
    {
        //checks the type of reaction through the column 'reactiontype' which must be 'ReactionPost' or 'ReactionComment'
        if($this->reactiontype == 'ReactionPost'){
            return $this->belongsTo(Post::class, 'id_post');
        }
        else{
            return $this->belongsTo(Comment::class, 'id_comment');
        }
    }

    public function notification(): HasOne
    {
        return $this->hasOne(Notification::class, 'id_reaction');
    }

}
