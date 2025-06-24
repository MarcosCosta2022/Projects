@extends('layouts.app')
@section('leftbar')
    @include('partials.leftbar')
@endsection

@section('rightbar')
    @include('partials.bar')
@endsection



@section('content')
<br> <br> <br>
<div class="container">
    @if(session()->has('success'))
        <div class="alert alert-success">
            {{ session('success') }}
        </div>
    @endif
    @include('partials.profile')
    @if ($user->profilestate == 'blocked' && !Auth::user()->is_admin)
        <p>This user is blocked</p> 
    @elseif ($user->profilestate == 'public' || Auth::user()->follows($user) || Auth::user()->is_admin || $user->id == Auth::user()->id)
        <div id="posts">
            @foreach ($user->PostsLatestFirst()->get() as $post)
                @php
                    $isOwner = Auth::check() && $user && $user->id == Auth::user()->id;
                    $isVisible = is_null($post->visibility) || \Carbon\Carbon::parse($post->visibility)->isToday() || \Carbon\Carbon::parse($post->visibility)->isFuture();
                @endphp
                
                @if ($isOwner || $isVisible)
                    @include('partials.post', ['post' => $post])
                @endif
                @if ($isOwner && !is_null($post->visibility))
                <p class="card-text"><small class="text-muted">Visible until: {{ $post->visibility }}</small></p>
                @endif

            @endforeach
            <div id="padding">
                <p>No more posts</p>
            </div>
        </div>
    @else
        <p>This user is private</p>
    @endif
</div>
@endsection


