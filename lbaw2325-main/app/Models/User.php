<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Post;

// Added to define Eloquent relationships.
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

use  App\Http\Controllers\FileController;

use Illuminate\Database\Eloquent\Model;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // Don't add create and update timestamps in database.
    public $timestamps  = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'first_name',
        'last_name',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the user's feed, which include the posts from users he is following.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function feed(){
        $following = $this->followings()->pluck('id');
        $following->push($this->id);
        // must see if the post is public or if the user is a friend of the owner of the post
        return Post::select('post.*')
            ->leftJoin('users', 'users.id', '=', 'post.id_user')
            ->whereIn('id_user', $following)
            ->orWhere('users.profilestate', 'public')
            ->orWhereNull('post.id_user') // Include posts where user is null
            ->orderBy('post.created_at', 'desc');
    }

    /**
     * Get the user's posts.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'id_user');
    }

    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class, 'id_user');
    }

    public function groups(): BelongsToMany // Correctly using Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'groupmember', 'id_user', 'id_group')
                    ->withPivot('isgroupadmin');
    }

    public function adminGroups(): BelongsToMany
    {
        return $this->groups()
                    ->wherePivot('isgroupadmin', true);
    }


    // query to return user posts by created_at
    public function PostsLatestFirst()
    {
        return $this->hasMany(Post::class, 'id_user')->orderBy('created_at', 'desc');
    }

    public function notifications(): HasMany
    {   
        // order by date and then by id
        return $this->hasMany(Notification::class, 'id_user')->orderBy('created_at', 'desc')->orderBy('id', 'desc');
    }

    public function unreadNotifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'id_user')->where('read', false)->orderBy('created_at', 'desc');
    }


    public function getPicture()
    {
        return FileController::get('profile', $this->id);
    }
    
    //method to get username
    public function getUsername()
    {
        return $this->username;
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follow', 'id_followed', 'id_follower')
            ->whereIn('followstate', ['accepted', 'public']);
    }

    public function followings(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follow', 'id_follower', 'id_followed')
            ->whereIn('followstate', ['accepted', 'public']);
    }
    
    public function follows(User $user): bool
    {
        return $this->followings->contains($user);
    }

    public function isFollowedBy(User $user): bool
    {
        return $this->followers->contains($user);
    }
    

    public function mutualFollows()
    {
    
        return $this->followings->intersect($this->followers);
    }

    public function isBlocked(): bool
    {
        return $this->profilestate === 'blocked';
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(Reaction::class, 'id_user');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'id_user');
    }

}
