@forelse ($notifications as $notification)
    @if ($notification->notificationtype == 'CommentNotification')
        @include('notifications.comment', ['notification' => $notification])
    @elseif ($notification->notificationtype == 'LikedPost')
        @include('notifications.likeToPost', ['notification' => $notification])
    @elseif ($notification->notificationtype == 'NewFollower')
        @include('notifications.follow', ['notification' => $notification])
    @endif
@empty
    <p class="text-center my-3">No notifications to show.</p>
@endforelse

<div class ="container d-flex justify-content-center align-items-center" id="pagination-container"> {{ $notifications->links('pagination::bootstrap-4') }} </div>