@extends('layouts.app')

@section('leftbar')
    @include('partials.leftbar')
@endsection



@section('content')
<div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
    <div class="center-container container card" style="max-width: 600px;">
        <div id = "resetPassword" class="container card-body">
            <form action="{{ route('password.update') }}" method="post">
                <legend>Reset Password</legend>
                <fieldset>
                @csrf

                <p> Reset your password for your account. </p>

                <p> <strong> Email: </strong> {{ $email }} </p>
                @if (session('status'))
                    <div class="alert alert-success" role="alert">
                        {{ session('status') }}
                    </div>
                @endif

                @if($errors->any())
                    <div class="alert alert-danger">
                        <ul>
                            @foreach($errors->all() as $error)
                                <li> {{ $error }} </li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <input type="hidden" name="token" value="{{ $token }}">
                <input type="hidden" name="email" value="{{ $email }}">

                <div class="form-group mb-3 @error('password') has-danger @enderror">
                    <label for="password">New Password:</label>
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
                <button type="submit" class="btn btn-primary mt-3">
                    Reset Password
                </button>
            </fieldset></form>
        </div>
    </div>
</div>


@endsection

@section('rightbar')
    @include('partials.bar')
@endsection
