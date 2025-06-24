<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;
use App\Models\Comment;
use App\Models\Notification;
use Illuminate\Auth\Access\HandlesAuthorization;


class NotificationPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the notification.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Notification  $notification
     * @return bool
     */
    public function show(User $user, Notification $notification)
    {

        return $user->id === $notification->id_user;
    }

    /**
     * Determine whether the user can update the notification.
     */
    public function update(User $user, Notification $notification)
    {
        return $user->id === $notification->id_user;
    }

    /**
     * Determine whether the user can delete the notification.
     */
    public function delete(User $user, Notification $notification)
    {
        return $user->id === $notification->id_user || $user->is_admin;
    }
    



}
