<div class="card mb-4 shadow-sm post" id="post-{{ $post->id }}">
    <div class="card-header bg-white d-flex align-items-center">
    <p> Nº of reports: </p>
    <p> {{ $post->reports->count() }} </p>
    <div id="buttons" class="buttons d-flex align-items-center ms-auto">
        <label for="dismissButton">Dismiss</label>
        <form action="/admin-dashboard/post/{{$post->id}}/reports" method="post" id="dismissReportsButton">
            @csrf
            @method('DELETE')
            <button id="dismissButton" type="submit">
                <i class="fa-solid fa-check"></i>
            </button>
        </form>
        @if($post->owner->profilestate !== 'blocked')
            <label for="blockButton">Block User</label>
            <form action="/user/{{$post->owner->id}}/block" method="post">
                @csrf
                <button id="blockButton" type="submit">
                    <i class="fa-solid fa-ban"></i>
                </button>
            </form>
        @else
            <label for="unblockButton">Unblock User</label>
            <form action="/user/{{$post->owner->id}}/unblock" method="post">
                @csrf
                <button id="unblockButton" type="submit">
                    <i class="fa-solid fa-ban"></i>
                </button>
            </form>
        @endif
        <label for="deleteButton">Delete</label>
        <form action="/post/{{$post->id}}" method="post">
            @csrf
            @method('DELETE')
            <button id="deleteButton" type="submit">
                <i class="fa-solid fa-trash"></i> 
            </button>
        </form>
    </div>
</div>
<div class="post" id = "post-{{ $post->id }}">
    <div class="card-header bg-white d-flex align-items-center">
        @if ($post->owner)
            <a href="{{ url('/user/' . $post->owner->id) }}" id="post-owner" class="d-flex align-items-center">
                <img src="{{ $post->owner->getPicture() }}" class="rounded-circle me-2" alt="User profile picture" width="40" height="40">
                <h3>{{ $post->owner->username }}</h3>
            </a>
        @else
            <div class="d-flex align-items-center">
                <img src="{{ url('icons/profilepic.png') }}" class="rounded-circle me-2" alt="Deleted User" width="40" height="40">
                <h5 class="mb-0">Deleted User</h5>
            </div>
        @endif
        <small class="ms-auto text-muted">{{ \Carbon\Carbon::parse($post->created_at)->format('d/m/Y H:i') }}</small>
    </div>
    <a href="{{ url('admin-dashboard/post/' . $post->id) }}" class="text-decoration-none text-dark">
        <div class="card-body">
            <p class="card-text">{{ $post->content }}</p>
            @if ($post->picture)
                <img src= "{{ $post->getPicture() }}" alt="Post Image" max-height="300px" class="img-fluid mt-3">
            @endif
        </div>
    </a>
    <div class="post-bottom d-flex justify-content-between align-items-center post-footer">
        <div class="post-actions d-flex align-items-center">
            <p class="number-of-likes"> 
                {{ $post->likes->count() }}
            </p>
            @if (Auth::check() && $post->likes->contains('id_user', Auth::user()->id))
                <i class="fa-solid fa-thumbs-up fa-xl iframesicons likeButton liked" ></i>
            @else
                <i class="fa-regular fa-thumbs-up fa-xl iframesicons likeButton"></i>
            @endif
            
            <p class="number-of-dislikes"> 
                {{ $post->dislikes->count() }}
            </p>
            @if (Auth::check() && $post->dislikes->contains('id_user', Auth::user()->id))
                <i class="fa-solid fa-thumbs-down fa-xl iframesicons dislikeButton disliked"></i>
            @else
                <i class="fa-regular fa-thumbs-down fa-xl iframesicons dislikeButton"></i>
            @endif

            <p class="number-of-comments">
                {{ $post->comments->count() }}
            </p>
            <a href=" {{ url('/post/' . $post->id) }} " class="text-decoration-none text-dark" > 
            <i class="fa-regular fa-comments fa-xl "></i>
            </a>
        </div>
    </div>
</div>
</div>