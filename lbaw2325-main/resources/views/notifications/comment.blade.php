<div class="card my-3">
    <div class="card-body comment-notification notification @if (!$notification->read) notification-not-read @else notification-read @endif d-flex flex-row align-items-center" id="notification-{{ $notification->id }}">
        <div class="notification-image position-relative">
            <a class="notification-read-link"  
                @if (!$notification->read)
                    href="{{ route('notification.markAsRead' , $notification->id) }}"
                @else 
                    href="{{ route('notification.markAsNotRead' , $notification->id) }}"
                @endif
            >
                <img src="{{ $notification->comment->owner->getPicture() }}" alt="User profile picture" class="rounded-circle" width="70" height="70">
                <div class="notification-image-overlay position-absolute rounded-circle d-flex justify-content-center align-items-center"  style="background-color: #2C3E50; top: -2px; right: -5px; width: 27px; height: 27px;">
                    <i class="fa-solid fa-comment text-white"></i>
                </div>
            </a>
        </div>
        <div class="notification-text d-inline container">
            <p class = "my-1">
                <span class="badge bg-info newTag">New</span>
                <a href="{{ url('user/' . $notification->comment->owner->id) }}">
                    <strong>{{ $notification->comment->owner->username }}</strong>
                </a>
                commented on 
                <a href="{{ route('showPost', $notification->comment->post->id) }}">your post</a>:
            </p>
            <p class="comment-notification-comment my-1">
                <strong>{{ $notification->comment->content }} </strong>
            </p>
            <p class="comment-notification-date my-1 ">
                {{ Carbon\Carbon::parse($notification->created_at)->diffForHumans() }}
            </p>
        </div>       
        <div >
            <li class="nav-item dropdown" id ="notification-settings">
                <a class="nav-link dropdown-toggle" id = "notificationssettingbutton" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"> </a>
                <div class="dropdown-menu">
                    <form action="{{ route('notification.delete' , $notification->id) }}" method="POST">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="comment-notification-button dropdown-item">Delete</button>
                    </form>
                    @if (!$notification->read)
                        <a class="dropdown-item" href="{{ route('notification.markAsRead' , $notification->id) }}"> Mark as read </a>
                    @else 
                        <a class="dropdown-item" href="{{ route('notification.markAsNotRead' , $notification->id) }}"> Mark as not read </a>
                    @endif
                </div>
            </li>
        </div>
    </div>
</div>