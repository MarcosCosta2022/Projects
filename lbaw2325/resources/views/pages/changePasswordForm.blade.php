@extends('layouts.app')

@section('leftbar')
    @include('partials.leftbar')
@endsection

@section('content')
    <br> <br> <br> <br> 
    <div class="center-container">
        <div id="loginForm" class="container">
            <form action="{{ url('user/' . $user->id . '/change-password') }}" method="post">
                <legend>Change password</legend>
                <fieldset>
                    {{ csrf_field() }}

                    @foreach($errors->all() as $error)
                        <p class="text-danger" style="margin:0;">{{ $error }}</p>
                    @endforeach

                    <div class="form-group">
                        <label for="old_password" class="form-label mt-4">Old Password</label>
                        <input type="password" class="form-control" id="old_password" placeholder="Old Password" autocomplete="off" name="old_password">
                    </div>

                    <div class="form-group">
                        <label for="password" class="form-label mt-4">New Password</label>
                        <input type="password" class="form-control" id="password" placeholder="Password" autocomplete="off" name="new_password">
                    </div>
                    
                    <div class="form-group">
                        <label for="password_confirmation" class="form-label mt-4">Confirm New Password</label>
                        <input type="password" class="form-control" id="password_confirmation" placeholder="Confirm Password" autocomplete="off" name="new_password_confirmation">
                    </div>

                    <div>
                        <button type="submit" class="btn btn-primary">Confirm</button>
                    </div>
                </fieldset>
            </form>
        </div>
    </div>
@endsection

@section('rightbar')
    @include('partials.bar')
@endsection