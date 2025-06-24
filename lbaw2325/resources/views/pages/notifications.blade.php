@extends('layouts.app')

@section('leftbar')
    @include('partials.leftbar')
@endsection

@section('page-title')
Notifications
@endsection

@section('content')
<div class="container-sm">
    <h1 class="m-3">Notifications</h1>
    <div id = "notification-overall-actions" class="d-flex flex-row align-items-center justify-content-start mx-3 my-2">
        <form action="{{ route('notification.deleteAll') }}" method="POST" class="d-flex justify-content-end">
            @csrf
            @method('DELETE')
            <button type="submit" class="btn btn-primary m-0">Delete all</button>
        </form>
        <a href="{{ route('notification.markAllAsRead') }}" class="btn btn-primary mx-2">Mark all as read</a>
    </div>
    <ul class="nav nav-tabs mx-3 custom-tabs" role="tablist" id="myTab">
        <li class="nav-item" role="presentation">
            <a class="nav-link active" data-bs-toggle="tab" href="#all" aria-selected="true" role="tab" id="alltab">All</a>
        </li>
        <li class="nav-item" role="presentation">
            <a class="nav-link" data-bs-toggle="tab" href="#new" aria-selected="false" role="tab" tabindex="-1" id = "newtab">New</a>
        </li>
        <li class="nav-item" role="presentation">
            <a class="nav-link" data-bs-toggle="tab" href="#follows" aria-selected="false" role="tab" tabindex="-1"  id = "followstab">Follows</a>
        </li>
        <li class="nav-item" role="presentation">
            <a class="nav-link" data-bs-toggle="tab" href="#likes" aria-selected="false" role="tab" tabindex="-1"  id = "likestab">Likes</a>
        </li>
        <li class="nav-item" role="presentation">
            <a class="nav-link" data-bs-toggle="tab" href="#comments" aria-selected="false" role="tab" tabindex="-1"  id = "commentstab">Comments</a>
        </li>
    </ul>
    <div id="myTabContent" class="tab-content mx-3">
        <div class="tab-pane fade active show" id="all" role="tabpanel">
            @include('notifications.tab', ['notifications' => $notifications])
        </div>
        <div class="tab-pane fade" id="new" role="tabpanel">
            @include('notifications.tab', ['notifications' => $unreadNotifications])
        </div>
        <div class="tab-pane fade" id="follows" role="tabpanel">
            @include('notifications.tab', ['notifications' => $followNotifications])
        </div>
        <div class="tab-pane fade" id="likes" role="tabpanel">
            @include('notifications.tab', ['notifications' => $likeNotifications])
        </div>
        <div class="tab-pane fade" id="comments" role="tabpanel">
            @include('notifications.tab', ['notifications' => $commentNotifications])
        </div>
    </div>
</div>

@endsection

@section('rightbar')
    @include('partials.bar')
@endsection




