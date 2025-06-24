@php
    $follow = $notification->cause;
@endphp
<div class="card my-3">
    <div class="card-body follow-notification notification @if (!$notification->read) notification-not-read @else notification-read @endif d-flex flex-row align-items-center" id="notification-{{ $notification->id }}">
        <div class="notification-image position-relative">
            <a class="notification-read-link"  
                @if (!$notification->read)
                    href="{{ route('notification.markAsRead' , $notification->id) }}"
                @else 
                    href="{{ route('notification.markAsNotRead' , $notification->id) }}"
                @endif
            >
                <img src="{{ $notification->cause->follower->getPicture() }}" alt="User profile picture" class="rounded-circle" width="70" height="70">
                <div class="notification-image-overlay position-absolute rounded-circle d-flex justify-content-center align-items-center"  style="background-color: #2C3E50; top: -2px; right: -5px; width: 27px; height: 27px;">
                <i class="fa-solid fa-user-plus text-white"></i>
                </div>
            </a>
        </div>
        <div class="notification-text d-inline container">
            <p class = "my-1">
                <span class="badge bg-info newTag">New</span>
                @if ($follow->followstate === 'rejected')
                    You rejected
                @endif
                <a href="{{ url('user/' . $follow->follower->id) }}">
                    <strong>{{ $notification->cause->follower->username }}</strong>
                </a>
                @if ($follow->followstate === 'accepted')
                    has his cowbell ringing for you as you accepted his follow request.
                @elseif ($follow->followstate === 'public')
                    started following you.
                @elseif ($follow->followstate === 'pending')
                    wants to follow you:
                @elseif ($follow->followstate === 'rejected')
                    's follow request.
                @endif
            </p>            
            <p class="comment-notification-date my-1 ">
                {{ Carbon\Carbon::parse($notification->created_at)->diffForHumans() }}
            </p>
            <div id = "followRequestButtons" class="d-flex flex-row">
                @if ($follow->followstate === 'pending')
                    <form action="{{ route('follow.accept', $follow->follower->id) }}" method="POST">
                        @csrf
                        <button type="submit" class="btn btn-success">Accept</button>
                    </form>
                    <form action="/follow/request/user/3/reject" method="POST">
                        @csrf
                        <button type="submit" class="btn btn-danger mx-2">Reject</button>
                    </form>
                @elseif ($follow->followstate !== 'rejected' && !Auth::user()->follows($follow->follower) && !$follow->followstate === 'pending')
                    <form action="{{ route('follow', $follow->follower->id) }}" method="POST">
                        @csrf
                        <button type="submit" class="btn btn-primary">Follow back</button>
                    </form>
                @endif
            </div>
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
