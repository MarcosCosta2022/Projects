@extends('layouts.app')

@section('leftbar')
    @include('partials.leftbar')
@endsection



@section('content')
<br> <br> <br> <br> 
    <div class="center-container">
        <div id = "loginForm" class="container">
            <form action="{{ route('login') }}" method="post">
                <h3>Login</h3>
                <fieldset>
                @csrf

                @foreach($errors->all() as $error)
                    <p class="text-danger" style="margin:0;">{{ $error }}</p>
                @endforeach

                <div class="form-group">
                    <label for="email" class="form-label mt-4">Email address</label>
                    <input type="email" class="form-control" id="email" placeholder="Enter email" name="email">
                    
                </div>

                <div class="form-group">
                    <label for="password" class="form-label mt-4">Password</label>
                    <input type="password" class="form-control" id="password" placeholder="Password" autocomplete="off" name="password">
                </div>
                <div class = "d-flex flex-row align-items-center">
                    <button type="submit" class="btn btn-primary">Login</button>
                    <a href="/register" class="m-0 mx-3">Register</a>
                    <span> or </span>
                    <a href="{{ route('password.request') }}" class="m-0 mx-3">Reset Password</a>
                </div>
            </fieldset></form>
        </div>
    </div>
@endsection

@section('rightbar')
    @include('partials.bar')
@endsection