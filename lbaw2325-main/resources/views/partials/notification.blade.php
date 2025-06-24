<div class = "notification">
    <div class = "notification-top">
        <div class = "notification-top-left">
            <img src = "{{ $notification->receiver->profilePicture }}" alt = "Profile picture">
        </div>
        <div class = "notification-top-right">
            <p>{{ $notification->receiver->name }}</p>
            <p>{{ $notification->created_at }}</p>
        </div>
    </div>
    <div class = "notification-bottom">
        @if ($notification->notificationtype == 'CommentNotification')
            <p>Commented on your post:</p>
            <p>{{ $post->title }}</p>
            <p>{{ $comment->content }}</p>
        @elseif ($notification->notificationtype == 'FriendRequestNotification')
            <p>Sent you a friend request.</p>
            <p>{{ $sender->name }}</p>
        @elseif ($notification->notificationtype == 'LikedPost')
            <p>Liked your post:</p>
            <p>{{ $post->content }}</p>
            <p>{{ $reaction->reactiontype }}</p>
        @elseif ($notification->notificationtype == 'NewFollower')
            <p>Started following you.</p>
            <p>{{ $follower->name }}</p>
        @endif
    </div>
</div>