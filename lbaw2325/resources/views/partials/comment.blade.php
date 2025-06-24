
<div class="comment mb-3" id="comment-{{ $comment->id }}">
    <div class="d-flex align-items-center mb-2">
        @if ($comment->owner)
            <a href="{{route('user.show', $comment->owner->id)}}" class="d-flex align-items-center">
                <img src="{{ $comment->owner->getPicture() }}" alt="User profile picture" class="rounded-circle me-2" width="40" height="40">
                <h6 class="mb-0">{{ $comment->owner->username }}</h6>
            </a>
        @else
            <div class="d-flex align-items-center">
                <img src="{{ url('icons/profilepic.png') }}" alt="Deleted User" class="rounded-circle me-2" width="40" height="40">
                <h6 class="mb-0">Deleted User</h6>
            </div>
        @endif
        <small class="ms-auto text-muted">{{ \Carbon\Carbon::parse($comment->created_at)->diffForHumans() }}</small>
    </div>
    <p>{{ $comment->content }}</p>
    <div class = "comment-bottom">
        <div class="comment-actions">
            <p class="number-of-likes"> 
                {{ $comment->likes->count() }}
            </p>
            @if (Auth::check() && $comment->likes->contains('id_user', Auth::user()->id))
                <i class="fa-solid fa-thumbs-up  iframesicons likeButton liked"></i>
            @else
                <i class="fa-regular fa-thumbs-up  iframesicons likeButton"></i>
            @endif
            
            <p class="number-of-dislikes"> 
                {{ $comment->dislikes->count() }}
            </p>
            @if (Auth::check() && $comment->dislikes->contains('id_user', Auth::user()->id))
                <i class="fa-solid fa-thumbs-down  iframesicons dislikeButton disliked"></i>
            @else
                <i class="fa-regular fa-thumbs-down  iframesicons dislikeButton"></i>
            @endif
        </div>
        <div class="buttons align-items-center comment-buttons">
            @auth
                @if (Auth::id() === $comment->owner->id || Auth::user()->is_admin)
                    <a id="editButton" class="me-2">
                        <i class="fa-solid fa-pencil" style="vertical-align: baseline;"></i>
                    </a>
                    <form action=" {{ route('comment.delete', $comment->id) }}
                    " method="post" class="d-inline">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-link p-0 deleteCommentButton">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </form>
                @endif
            @endauth
        </div>
    </div>
</div>

