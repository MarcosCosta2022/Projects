@extends('layouts.app')

@section('leftbar')
    @include('partials.leftbar')
@endsection

@section('content')
<div class="container my-4">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <form action="{{ route('register') }}" method="post" class="card p-4">
                    <h2 class="text-center mb-4">Register</h2>
                    {{ csrf_field() }}
                    @error('error')
                        <p class="text-danger" style="margin:0;">{{ $message }}</p>
                    @enderror
                    <div id="fullname">
                        <div class="form-group mb-3 @error('firstname') has-danger @enderror">
                            <label for="firstname" >First Name:</label>
                            <input type="text" id="firstname" name="firstname" class="form-control @error('firstname') is-invalid @enderror" required value="{{ old('firstname') }}">
                            @error('firstname')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group mb-3 @error('lastname') has-danger @enderror">
                            <label for="lastname" >Last Name:</label>
                            <input type="text" id="lastname" name="lastname" class="form-control @error('lastname') is-invalid @enderror" required value="{{ old('lastname') }}">
                            @error('lastname')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="form-group mb-3 @error('username') has-danger @enderror">
                        <label for="username" >Username:</label>
                        <input type="text" id="username" name="username" class="form-control @error('username') is-invalid @enderror" required value="{{ old('username') }}">
                        @error('username')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="form-group mb-3 @error('email') has-danger @enderror">
                        <label for="email" >Email:</label>
                        <input type="email" id="email" name="email" class="form-control @error('email') is-invalid @enderror" required value="{{ old('email') }}">
                        @error('email')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @else
                            <small class="form-text text-muted">We'll never share your email with anyone else.</small>
                        @enderror
                    </div>

                    <div class="form-group mb-3 @error('password') has-danger @enderror">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" class="form-control @error('password') is-invalid @enderror" required>
                        @error('password')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="form-group mb-3 @error('password_confirmation') has-danger @enderror">
                        <label for="password_confirmation">Confirm Password:</label>
                        <input type="password" id="password_confirmation" name="password_confirmation" class="form-control @error('password_confirmation') is-invalid @enderror" required>
                        @error('password_confirmation')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="form-group mb-3 @error('birthdate') has-danger @enderror">
                        <label for="birthdate">Birthdate:</label>
                        <input type="date" id="birthdate" name="birthdate" class="form-control" required  max="{{ date('Y-m-d') }}" value="{{ old('birthdate') }}">
                        @error('birthdate')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <button type="submit" class="btn btn-primary w-100">Register</button>
                    <p class="text-center mt-3">
                        <a href="/login">Login</a>
                    </p>
                </form>
            </div>
        </div>
    </div>
@endsection

@section('rightbar')
    @include('partials.bar')
@endsection
