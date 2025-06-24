@extends('layouts.app')

@section('leftbar')
    @include('partials.leftbar')
@endsection

@section('rightbar')
    @include('partials.bar')
@endsection


@section('content')
<!-- SweetAlert2 script and style inclusion -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.5.1/dist/sweetalert2.all.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.5.1/dist/sweetalert2.min.css">

<div class="container mt-4">
    
             
    @include('admin.reportedpost', ['post' => $post])

    <h3 class="section-title">Reports to this post</h3>
    <div class="reports-container">
        @foreach ($post->reports as $report)
            @include('partials.report', ['report' => $report])
        @endforeach
    </div>
</div>

@endsection
