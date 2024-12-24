@if (Auth::Check())
<div class="container mt-4">

    <div class="container mt-4">
        <div class="scrolling-wrapper">
            @foreach ($followings as $following)
                <a href="{{ url('/user/' . $following->id) }}" class="text-decoration-none text-dark">

                    <img src="{{ $following->getPicture()}}" class="rounded-circle" style="width: 60px; height: 60px; object-fit: cover;" alt="Profile Picture">
                    <h5 class="mb-0" style="font-size: 0.8rem; display: flex;justify-content: center;}">{{ $following->username }}</h5>

                </a>

            @endforeach
        </div>
    </div>
  <br> <br> 

    <form action="{{ route('post.create') }}" method="post" class="mb-4" enctype="multipart/form-data">
        @csrf
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Create New Post</h5>
                <button type="submit" id="create-post-btn" class="btn btn-primary float-right">Create Post</button>
                
                <div id="file-error-message" class="text-danger mb-3"></div>

                <!-- Textarea for post content -->
                <textarea class="form-control" id="post-content" name="content" rows="3" placeholder="Write your thought here..." required></textarea>

                <div class="form-group">
                    <div class="row">
                        <div class="col-md-6">
                            <label for="picture">Picture:</label>
                            <input type="file" class="form-control" id="picture" name="picture" onchange="previewPostImage(event)">
                            <div id="imagePreviewContainer" class="mt-2" style="display: none;">
                                <img id="picturePreview" class="img-fluid" alt="preview picture" src="#"> 
                                <div class="d-flex align-items-center mt-2">
                                    <a href="#" class="btn btn-link" onclick="clearPreviewAndFileInput()">
                                        <i class="fas fa-trash"></i>
                                        <span class="ml-2">Remove Image</span>
                                    </a>
                                </div>
                            </div>
                            <div id="visual-error-message" class="text-danger"></div>
                        </div>
                        <div class="col-md-6">
                            <label for="visibility">Visibility:</label>
                            <input type="date" class="form-control" id="visibility" name="visibility">
                            @error('visibility')
                                <p class="text-danger text-xs mt-1">{{ $message }}</p>
                            @enderror
                            <div class="form-check mt-2">
                                <input type="checkbox" class="form-check-input" id="forever" name="forever" onchange="toggleVisibility()">
                                <label class="form-check-label" for="forever">Forever</label>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </form>
</div>
@endif

<div class="container">
    @foreach ($posts->where('group_id', null)->sortByDesc('created_at') as $post)
        @php
            $isVisible = is_null($post->visibility) || \Carbon\Carbon::parse($post->visibility)->isToday() || \Carbon\Carbon::parse($post->visibility)->isFuture();
        @endphp

        @if ($isVisible)
            @include('partials.post', ['post' => $post])
        @endif
    @endforeach
    <div id="padding" class="text-center my-4">
        <p>No more posts</p>
    </div>
</div>

@if(Auth::check())
    <script>
        function toggleVisibility() {
            var visibilityInput = document.getElementById('visibility');
            var foreverCheckbox = document.getElementById('forever');

            // If the 'Forever' checkbox is checked, disable the date input
            visibilityInput.disabled = foreverCheckbox.checked;
        }

        // Run on load to set the initial state
        window.onload = function () {
            toggleVisibility();
        };
    </script>
@endif

