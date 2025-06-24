<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Comment;
use App\Models\Report;

// Added to define Eloquent relationships.
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Http\Controllers\FileController;

class Post extends Model
{
    use HasFactory;

    protected $table = 'post';
    // Don't add create and update timestamps in database.
    public $timestamps  = false;

    protected $fillable = [
        'id_user', 'group_id', 'content', 'created_at'
    ];

    /**
     * Get the user that owns the post.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class , 'id_user');
    }

    /**
     * Get the comments for the post.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class , 'id_post');
    }


    /**
     * Get the reactions for the post.
     */
    public function reactions(): HasMany
    {
        return $this->hasMany(Reaction::class , 'id_post');
    }


    /**
     * Get the likes for the post.
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Reaction::class , 'id_post')->where('liked', true);
    }

    /**
     * Get the dislikes for the post.
     */
    public function dislikes(): HasMany
    {
        return $this->hasMany(Reaction::class , 'id_post')->where('liked', false);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class , 'id_post');
    }



    public static function publicPosts()
    {
        return Post::select('post.*')
            ->leftJoin('users', 'users.id', '=', 'post.id_user')
            ->where(function ($query) {
                $query->where('users.profilestate', 'public')
                    ->orWhereNull('post.id_user'); // Include posts where owner is null
            })
            ->orderBy('post.created_at', 'desc');
    }

    public function commentsOrderByLikes()
    {
        return $this->comments()
            ->withCount('likes')
            ->orderByDesc('likes_count')
            ->orderBy('created_at', 'desc');
    }

    public static function reportedPostsOrder()
    {
        return self::has('reports')
                    ->withCount('reports')
                    ->orderBy('reports_count', 'desc')
                    ->get();
    }
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'id_group');
    }


    // method to get the post picture
    public function getPicture()
    {
        return FileController::get('post', $this->id);
    }

}

