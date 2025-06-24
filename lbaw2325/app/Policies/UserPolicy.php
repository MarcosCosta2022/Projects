<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Auth;

use App\Http\Models\FriendRequest;


class UserPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }


    /**
     * Determine if a user can see (show) another user.
     */
    public function show(?User $user, User $user2): bool
    {
        // User can only see a profile if it is one of their friends, their own profile, a public profile, or if they are an admin.
        if ($user2->profilestate === 'public') return true;

        if (!$user) return false;

        if ($user->id === $user2->id) return true;

        if ($user->is_admin) return true;

        if ($user->friends->contains($user2->id)) return true;

        return false;
    }

    /**
     * Determine if a user can update another user.
     */
    public function update(User $user, User $user2): bool
    {
        // User can only edit a profile if it is their own profile or if they are admin.

        return $user->id === $user2->id || $user->is_admin;
    }

    public function delete(User $user, User $user2): bool
    {
        // User can only delete a profile if it is their own profile or if they are an admin.
        return $user->id === $user2->id || $user->is_admin;
    }

    public function listAllFriends(User $auth , User $user) : bool
    {
        // to be able to know a users friends u are either the user himself or a friend or admin or the profile is public
        return $auth->id === $user->id || FriendRequest::areFriends($auth , $user) || $user->is_admin || $user->profilestate = 'public';
    }

    public function listFriendRequests(User $auth , User $user) : bool
    {
        // the user himself or admin
        return $auth->id === $user->id || $user->is_admin;
    }

    public function block(User $auth , User $user) : bool
    {
        // only admin can block accounts
        return $auth->is_admin;
    }

    public function unblock(User $auth , User $user) : bool
    {
        // only admin can block accounts
        return $auth->is_admin;
    }

}
