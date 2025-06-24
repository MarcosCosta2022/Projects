@extends('layouts.app')

@section('leftbar')
    @include('partials.leftbar')
@endsection

@section('rightbar')
    @include('partials.bar')
@endsection



@section('content')
    <div class="container mt-5">
        <h2 class="mb-4">Searching for: {{ $query }}</h2>

        <div class="row mb-5">
            <div class="col-md-4">
                <h3>Users</h3>
                @forelse ($users as $user)
                    <div class="card mb-3">
                        <div class="card-body">
                            <a href="/user/{{ $user->id }}" class="d-flex align-items-center">
                                <img src="{{ $user->getPicture() }}" alt="{{ $user->username }}" class="rounded-circle m-0" width="50" height="50">
                                <span style="margin-left: .5rem">{{ $user->username }}</span>
                            </a>
                        </div>
                    </div>
                @empty
                    <p>No more users</p>
                @endforelse
            </div>

            <div class="col-md-4">
                <h3>Posts</h3>
                @forelse ($posts as $post)
                    @php
                        $isVisible = is_null($post->visibility) || \Carbon\Carbon::parse($post->visibility)->isToday() || \Carbon\Carbon::parse($post->visibility)->isFuture();
                    @endphp
                    @if ($isVisible)
                    <div class="card mb-3">
                        <a href="/post/{{ $post->id }}" class="d-flex align-items-center card-header">
                            <img src="{{ $post->owner->getPicture() }}" alt="{{ $post->owner->username }}" class="rounded-circle m-0" width="50" height="50">
                            <span style="margin-left: .5rem">{{ $post->owner->username }}</span>
                        </a>
                        <a href="/post/{{ $post->id }}" class="d-flex align-items-center card-body">
                            <p style="word-wrap: break-word; overflow: hidden; font-size: 1rem; padding: 10px;">{{ $post->content }}</p>
                        </a>
                    </div>
                    @endif
                @empty
                    <p>No more posts</p>
                @endforelse
            </div>

            <div class="col-md-4">
                <h3>Groups</h3>
                @forelse ($groups as $group)
                    <div class="card mb-3">
                        <div class="card-body">
                            <a href="/group/{{ $group->id }}" class="d-flex align-items-center">
                                <img src="{{ $group->getPicture() }}" class="rounded-circle me-3" style="width: 50px; height: 50px;" alt="group picture"> 
                                <span>{{ $group->name }}</span>
                            </a>
                        </div>
                    </div>
                @empty
                    <p>No groups found</p>
                @endforelse
            </div>
        </div>
    </div>
@endsection
