@extends('layouts.app')
@section('leftbar')
    @include('partials.leftbar')
@endsection


@section('page-title')
Create Post
@endsection

@section('rightbar')
    @include('partials.bar')
@endsection

@section('content')
    <br> <br> <br>
    @if ($errors->any())
        <div id="errors" class="alert alert-danger">
            <ul class="mb-0">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    @endif

    <div id="createPostForm" class="card p-4">
        <form action="{{ route('createPostForm') }}" method="post" enctype="multipart/form-data">
            <h2 class="card-title">Create your Post</h2>
            @csrf

            <div class="form-group">
                <label for="content">Content:</label>
                <textarea class="form-control" id="post-content" name="content" rows="3" placeholder="Write your thought here..." required></textarea>
                @error('content')
                <p class="text-danger text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="form-group">
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

            <div class="form-group">
                <label for="picture">Picture:</label>
                <input type="file" class="form-control-file" id="picture" name="picture" onchange="previewImage(event)">
                <img id="picturePreview" class="img-fluid mt-2" style="display: none;" alt='Picture Preview'>
            </div>
            @if(isset($group_id))
            <!-- Hidden input for group_id -->
            <input type="hidden" name="group_id" value="{{ $group_id }}">
        @endif
            <button type="submit" class="btn btn-primary">Create</button>
        </form>
    </div>

    <script>
        function previewImage(event) {
            var reader = new FileReader();
            reader.onload = function() {
                var output = document.getElementById('picturePreview');
                output.src = reader.result;
                output.style.display = 'block';
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


