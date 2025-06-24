<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PostPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the post.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Post  $post
     * @return bool
     */
    public function show(?User $user, Post $post)
    {
        $postOwner = $post->owner;

        if (!$postOwner)
            return true;
        
        if ($postOwner->profilestate === 'public') {
            return true;
        }

        if ($user->id === $postOwner->id) {
            return true;
        }

        if ($user->is_admin) {
            return true;
        }

        if ($user->friends->contains($postOwner->id)) {
            return true;
        }

        return false;
    }

    public function comment(User $user, Post $post)
    {
        $postOwner = $post->owner;

        if ($postOwner->profilestate === 'public') {
            return true;
        }

        if ($user->id === $postOwner->id) {
            return true;
        }

        if ($user->is_admin) {
            return true;
        }

        // $user->friends returns a collection of User objects.
        if ($user->friends->contains($postOwner)) {
            return true;
        }

        return false;
    }

}
