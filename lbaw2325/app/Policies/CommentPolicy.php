<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;
use App\Models\Comment;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Gate;


class CommentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can see the comment
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Comment  $comment
     * @return bool
     */
    public function show(User $user, Comment $comment)
    {
        // User can only see a comment if they can see the post it belongs to.
        return Gate::allows('show', $comment->post);
    }

    /**
     * Determine whether the user can edit the comment
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Comment  $comment
     * @return bool
     */
    public function update(User $user, Comment $comment)
    {
        // User can only edit a comment if it is their own comment or if they are an admin.
        return $user->id === $comment->id_user;
    }



    /**
     * Determine whether the user can delete the comment
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Comment  $comment
     * @return bool
     */
    public function delete(User $user, Comment $comment)
    {
        // User can only delete a comment if it is their own comment or if they are an admin.
        return $user->id === $comment->id_user || $user->is_admin;
    }

    /**
     * Determine whether the user can like the comment
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Comment  $comment
     * @return bool
     */
    public function react(User $user, Comment $comment)
    {
        // User can react to a comment if they can see it and they are logged in.
        return $this->show($user, $comment);
    }


    /**
     * Determine whether the user can comment on a post
     * 
     * @param  \App\Models\User  $user
     * @param  \App\Models\Post  $post
     * @return bool
     */
    public function comment(User $user, Post $post)
    {
        // User can comment on a post if they can see it and they are logged in.
        return $this->show($user, $post);
    }

}
