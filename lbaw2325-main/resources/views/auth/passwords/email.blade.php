@extends('layouts.app')

@section('leftbar')
    @include('partials.leftbar')
@endsection



@section('content')
<div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
    <div class="center-container container card" style="max-width: 600px;">
        <div id = "recoverPasswordRequest" class="container card-body">
            <form action="{{ route('password.email') }}" method="post">
                <legend>Recover Password</legend>
                <fieldset>
                @csrf

                <p> Enter your email address and we will send you a link to reset your password. </p>

                @if (session('status'))
                    <div class="alert alert-success" role="alert">
                        {{ session('status') }}
                    </div>
                @endif


                <div class="form-group mb-3 @error('email') has-danger @enderror">
                    <label for="email" class="form-label mt-4">Email address</label>
                    <input id="email" type="email" class="form-control @error('email') is-invalid @enderror" name="email" value="{{ old('email') }}" required autocomplete="email" autofocus>
                    @error('email')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
                <button type="submit" class="btn btn-primary mt-3">
                    Send Password Reset Link
                </button>
            </fieldset></form>
        </div>
    </div>
</div>

@endsection

@section('rightbar')
    @include('partials.bar')
@endsection
