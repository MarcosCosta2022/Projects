@extends('layouts.app')

@section('leftbar')
    @include('partials.leftbar')
@endsection

@section('page-title')
Admin Dashboard
@endsection

@section('content')
<div class="mx-3" id ="admin">
    <div id="admin-header">
        <h1 class="admin-title">Admin Dashboard</h1>
    </div> 
    <div id="adminSections" class="row">
        <div id="postSection" class="col-md-6 adminsec">
            <h5>Reported Posts ({{ $totalReports }})</h5>
            <div class="vertical-scrollable mt-2" style="max-height: 850px; overflow-y: auto;">
                @forelse ($reportedPosts as $post)            
                    @include('admin.reportedpost', ['post' => $post])
                @empty
                    <div id="padding">
                        <p class="text-center">No reported posts</p>
                    </div>
                @endforelse
                <br>
            </div>
        </div>
        <div id="userSection" class="col-md-6 adminsec border-left h-100">
            <div class="d-flex justify-content-between align-items-center">
                <h5 style="margin-right:5em">Users</h5>
                <input class="form-control me-sm-2" type="search" placeholder="Search for username" id="searchUserAdminInput">
            </div>
            <div class="vertical-scrollable mt-2">
                @foreach ($users as $user)            
                    @if ($user->id !== auth()->id())
                        @include('admin.userview', ['user' => $user])
                    @endif
                @endforeach
                <br>
            </div>
        </div>
    </div>
</div>
@endsection

@section('rightbar')
    @include('partials.bar')
@endsection

