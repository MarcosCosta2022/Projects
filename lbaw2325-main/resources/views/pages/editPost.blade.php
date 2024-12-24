@extends('layouts.app')
@section('leftbar')
    @include('partials.leftbar')
@endsection


@section('rightbar')
    @include('partials.bar')
@endsection

@section('page-title')
Edit Post
@endsection

@section('content')
<br> <br> <br>
    <div class="container my-4">
        @if ($errors->any())
            <div class="alert alert-danger" id="errors">
                <ul>
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <div class="card p-4">
            <h2 class="card-title">Edit your post</h2>
            <form action="/post/{{$post->id}}" method="post" enctype="multipart/form-data" class="mt-3">
                @csrf
                @method('PUT')

                <div class="form-group mb-3">
                    <label for="content" class="form-label">Content:</label>
                    <input type="text" id="content" name="content" class="form-control" value="{{$post->content}}">
                    @error('content')
                        <p class="text-danger text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

               
                <div class="form-group">
                    <label for="visibility">Visibility:</label>
                    @php
                        $oldVisibility = old('visibility');
                        $shouldCheckForever = is_null($oldVisibility) ? is_null($post->visibility) : false;
                    @endphp
                    <input type="date" class="form-control" id="visibility" name="visibility" value="{{ $oldVisibility ?? $post->visibility }}"> 
                    @error('visibility')
                        <p class="text-danger text-xs mt-1">{{ $message }}</p>
                    @enderror
                
                    <div class="form-check mt-2">
                        <input type="checkbox" class="form-check-input" id="forever" name="forever" onchange="toggleVisibility()" {{ $shouldCheckForever ? 'checked' : '' }}>
                        <label class="form-check-label" for="forever">Forever</label>
                    </div>
                </div>

                <div class="form-group mb-3">
                    <label for="picture" class="form-label">Picture:</label>
                    <input type="file" class="form-control-file" id="picture" name="picture" onchange="previewImage(event)">
                    <div class="form-group mt-2">
                        <img id="picturePreview" src="{{ asset('storage/' . $post->picture) }}" alt="Post Image" style="max-width: 200px; max-height: 200px;">
                    </div>
                </div>

                <button type="submit" class="btn btn-primary">Save</button>
            </form>
        </div>
    </div>

    <script>
        function previewImage(event) {
            var reader = new FileReader();
            reader.onload = function() {
                var output = document.getElementById('picturePreview');
                output.src = reader.result;
            };
            reader.readAsDataURL(event.target.files[0]);
        }
        function toggleVisibility() {
        var checkBox = document.getElementById("forever");
        var visibilityInput = document.getElementById("visibility");
        visibilityInput.disabled = checkBox.checked; // Disable the input if the checkbox is checked
        if (checkBox.checked) visibilityInput.value = ''; // Clear the input if the checkbox is checked
    }

    // Run on load to set the initial state
    window.onload = function() {
        toggleVisibility();
    };
    </script>
@endsection
