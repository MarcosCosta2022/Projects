@extends('layouts.app')
@section('leftbar')
    @include('partials.leftbar')
@endsection

@section('content')
    @include('partials.feed')
@endsection

@section('rightbar')
    @include('partials.bar')
@endsection



