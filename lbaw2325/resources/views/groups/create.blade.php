

@extends('layouts.app')

@section('leftbar')
    @include('partials.leftbar')
@endsection

@section('content')
<div class="container my-4 mx-4">
    <div class="custom-form-container">
        <h1 class="custom-form-heading">Create a New Group</h1>

        {{-- Success or error messages --}}
        @if (session('status'))
            <div class="alert alert-success">
                {{ session('status') }}
            </div>
        @endif

        {{-- Validation errors --}}
        @if ($errors->any())
            <div class="alert alert-danger">
                <ul>
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        {{-- Group creation form --}}
        <form method="POST" action="{{ route('groups.store') }}" enctype="multipart/form-data">
            @csrf

            {{-- Group Name --}}
            <div class="custom-form-group">
                <label for="name" class="custom-form-label">Group Name:</label>
                <input type="text" class="form-control custom-form-input" id="name" name="name" required>
            </div>

            {{-- Group Description --}}
            <div class="custom-form-group">
                <label for="description" class="custom-form-label">Description:</label>
                <textarea class="form-control custom-form-textarea" id="description" name="description"></textarea>
            </div>

            {{-- Group Picture --}}
            <div class="custom-form-group">
                <label for="picture" class="custom-form-label">Group Picture:</label>
            </div>
            <div class="custom-form-group">
                <input class="form-control" type="file" id="formFile" onchange="previewImage(event)" name="picture">
                <img src="" id="previewImg" class="img-fluid" alt="Preview Image">
           </div>
            
           

            {{-- Submit Button --}}
            <button type="submit" class="btn custom-submit-button">Create Group</button>
        </form>
    </div>
</div>
@endsection

@section('rightbar')
    @include('partials.bar')
@endsection

<script>
    function previewImage(event) {
        var reader = new FileReader();
        reader.onload = function() {
            var output = document.getElementById('previewImg');
            output.src = reader.result;
        };
        reader.readAsDataURL(event.target.files[0]);
    }
</script>

