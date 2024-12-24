<div class="card mb-4 shadow-sm post" id="post-{{ $post->id }}">
    <div class="card-header bg-white d-flex align-items-center">
        @if ($post->owner)
            <a href="{{ url('/user/' . $post->owner->id) }}" class="post-owner d-flex align-items-center">
                <img src="{{ $post->owner->getPicture() }}" class="rounded-circle me-2" alt="User profile picture" width="40" height="40">
                <h3>{{ $post->owner->username }}</h3>
            </a>
        @else
            <div class="d-flex align-items-center">
                <img src="{{ asset('resources/profile/default.jpg') }}" class="rounded-circle me-2" alt="Deleted User" width="40" height="40">
                <h5 class="mb-0">Deleted User</h5>
            </div>
        @endif
        <small class="ms-auto text-muted">{{ \Carbon\Carbon::parse($post->created_at)->format('d/m/Y H:i') }}</small>
    </div>

    <a href="{{ url('/post/' . $post->id) }}" class="text-decoration-none text-dark">
        <div class="card-body">
            <p class="card-text">{{ $post->content }}</p>
            @if ($post->picture)
                <img src= "{{ $post->getPicture() }}" alt="Post Image"  class="img-fluid mt-3">
            @endif
        </div>
    </a>
    <div class="post-bottom d-flex justify-content-between align-items-center">
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
        
        <div class="buttons d-flex align-items-center">
            @auth
                @if (!$post->reports->contains('id_user', Auth::user()->id) && $post->id_user !== Auth::user()->id)
                    <button class="reportButton me-2 ms-2" type="submit" data-post-id="{{ $post->id }}">
                        <i class="fa-solid fa-triangle-exclamation" style="vertical-align: baseline;"></i>
                    </button>
                @endif
                @if (Auth::id() === $post->id_user || Auth::user()->is_admin)
                    <a id="editButton" href="/post/{{$post->id}}/edit" class="me-2 ms-2">
                        <i class="fa-solid fa-pencil" style="vertical-align: baseline;"></i>
                    </a>
                    <form action="/post/{{$post->id}}" method="post" class="d-inline ms-2">
                        @csrf
                        @method('DELETE')
                        <button id="deleteButton" type="submit" class="btn btn-link p-0 align-middle">
                            <i class="fa-solid fa-trash" style="vertical-align: baseline;"></i>
                        </button>
                    </form>
                @endif
            @endauth
        </div>                    
    </div>
</div>