@extends('layouts.app')

@section('leftbar')
    @include('partials.leftbar')
@endsection

@section('page-title')
Edit Profile
@endsection

@section('content')
<br> <br> <br>
<div class="container mt-4">
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
  
            <form action="{{ url('user/' . $user->id . '/edit') }}" method="post" class="mt-3" enctype="multipart/form-data">
                {{ csrf_field() }}
                <div id="profileimageedit" class="row py-2">
                    <div class="col-md-6 text-center">
                        <img src="{{ $user->getPicture() }}" id="profileImg" class="img-fluid" style="width:10em;height:10em;border-radius:50%;" alt="Profile Image"> <!-- Display current profile picture -->
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="formFile" class="form-label mt-4">Chose a profile picture</label>
                            <input class="form-control" type="file" id="formFile" onchange="previewProfileImage(event)" name="picture">
                        </div>
                    </div>
                </div>
                <div id="fullname">
                    <div class="form-group mb-3 container-fluid p-0">
                        <label for="firstname" class="form-label">First Name:</label>
                        <input type="text" id="firstname" name="firstname" class="form-control" value="{{ $user->first_name }}">
                    </div>

                    <div class="form-group mb-3 container-fluid p0">
                        <label for="lastname" class="form-label">Last Name:</label>
                        <input type="text" id="lastname" name="lastname" class="form-control" value="{{ $user->last_name }}">
                    </div>
                </div>
                <div class="form-group mb-3">
                    <label for="bio" class="form-label">Bio:</label>
                    <textarea id="bio" name="bio" class="form-control">{{ $user->profile->bio }}</textarea>
                </div>

                <div class="form-group mb-3">
                    <label for="profilestate" class="form-label">Privacy:</label>
                    <select id="profilestate" name="profilestate" class="form-control" required>
                        <option value="public" {{ $user->profilestate === 'public' ? 'selected' : '' }}>Public</option>
                        <option value="private" {{ $user->profilestate === 'private' ? 'selected' : '' }}>Private</option>
                    </select>
                </div>

                <button type="submit" class="btn btn-primary">Update</button>
                <a href="javascript:void(0);" onclick="goBack()" class="btn btn-secondary">Back</a>
            </form>
        </div>
    </div>
    <script>
        function goBack() {
            window.history.back();
        }
        
        function previewImage(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            // Create an image element
            const img = new Image();
            img.src = e.target.result;

            // When the image is loaded, resize it
            img.onload = function () {
                // Create a canvas
                const canvas = document.createElement('canvas');
                const size = Math.min(img.width, img.height); // Determine the size of the square
                canvas.width = size;
                canvas.height = size;

                // Calculate the top-left point of the cropped area
                const startX = (img.width - size) / 2;
                const startY = (img.height - size) / 2;

                // Draw the cropped area onto the canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);

                // Convert the canvas to a data URL
                const dataURL = canvas.toDataURL('image/png');

                // Set the preview image and store the resized image for upload
                document.getElementById('profileImg').src = dataURL;
            };
        };

        reader.readAsDataURL(input.files[0]);
    }
}


    </script>
@endsection

@section('rightbar')
    @include('partials.bar')
@endsection
