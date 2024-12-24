@extends('layouts.app')

@section('leftbar')
    @include('partials.leftbar')
@endsection

@section('content')
    <div class="container mt-5 post" id="post-{{ $post->id }}">
        <div class="card shadow-lg mb-4">
            <div class="card-header bg-white d-flex align-items-center">
                @if ($post->owner)
                    <a href="{{ url('/user/' . $post->owner->id) }}" class="d-flex align-items-center">
                        <img src="{{$post->owner->getPicture()}}" alt="User profile picture" class="rounded-circle me-2" width="40" height="40">
                        <h5 class="mb-0">{{ $post->owner->username }}</h5>
                    </a>
                @else
                    <div class="d-flex align-items-center">
                        <img src="/resources/profile/default.jpg" alt="Deleted User" class="rounded-circle me-2" width="40" height="40">
                        <h5 class="mb-0">Deleted User</h5>
                    </div>
                @endif
                <small class="ms-auto">{{ \Carbon\Carbon::parse($post->created_at)->diffForHumans() }}</small>
            </div>

            <div class="card-body">
                <p>{{ $post->content }}</p>
                @if ($post->picture)
                    <img src="{{ $post->getPicture() }}" alt="Post Image" class="img-fluid mt-2">
                @endif
            </div>

            <div class="card-footer bg-white d-flex justify-content-between align-items-center">
                <div class="post-actions">
                    <span class="number-of-likes">{{ $post->likes->count() }}</span>
                    @if (Auth::check() && $post->likes->contains('id_user', Auth::user()->id))
                        <i class="fa-solid fa-thumbs-up  iframesicons likeButton liked me-2"></i>
                    @else
                        <i class="fa-regular fa-thumbs-up  iframesicons likeButton me-2"></i>
                    @endif
                    
                    <span class="number-of-dislikes">{{ $post->dislikes->count() }}</span>
                    @if (Auth::check() && $post->dislikes->contains('id_user', Auth::user()->id))
                        <i class="fa-solid fa-thumbs-down  iframesicons dislikeButton disliked me-2"></i>
                    @else
                        <i class="fa-regular fa-thumbs-down  iframesicons dislikeButton me-2"></i>
                    @endif

                    <span class="number-of-comments">{{ $post->comments->count() }}</span>
                   
                    <i class="fa-solid fa-comments"></i>
                </div>
            </div>
        </div>

        <div class="comments-section">
            <h2 class="section-title mb-3">Comments</h2>
            @if (Auth::Check())
                <form action="{{ route('comment.create' ,$post->id) }}" method="post" class="mb-3">
                    @csrf
                    <div class="form-group">
                        <textarea id="comment-content" name="content" class="form-control" rows="3" placeholder="Write your comment here..." required></textarea>
                    </div>
                    <input type="hidden" name="post_id" value="{{ $post->id }}">
                    <button type="submit" class="btn btn-primary submitComment-button">Submit Comment</button>
                </form>
            @endif

            <div class="post-comments">
                @foreach ($post->commentsOrderByLikes()->get() as $comment)
                    @include('partials.comment', ['comment' => $comment])
                @endforeach
            </div>
            @if ($post->comments->count() === 0)
                <div class="no-comments">
                    <p>No comments to show.</p>
                </div>
            @endif
        </div>
    </div>
@endsection

@section('rightbar')
    @include('partials.bar')
@endsection