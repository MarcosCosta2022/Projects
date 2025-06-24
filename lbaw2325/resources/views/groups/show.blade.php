@extends('layouts.app')

@section('leftbar')
    @include('partials.leftbar')
@endsection

@section('content')
<div class="group p-3">
    <div class="row d-relative">
        <div class="group-info text-center col-md-4 card-body">
            <div class="group-picture mt-2">
                <img src="{{ $group->getPicture() }}" alt="{{ $group->name }}"  width="200" height="200" class="img-thumbnail">
            </div>
            <h3><strong>{{ $group->name }}</strong></h3>
        </div>
        <div class="group-description col-md-8 mt-3 pt-3">
            <h8>Description:</h8>
            @foreach(explode("\n", $group->description) as $line)
                <p class="text-black" style="font-size: 1.2rem;"
                >{{ $line }}</p>
            @endforeach
            <h8>Members:</h8>
            <p class="text-black" style="font-size: 1.2rem;">
                @foreach($group->members as $member)
                    {{ $member->username }} , 
                @endforeach
            </p>
            <div id="GroupActions">
                @if(Auth::check() && $group->isMember(Auth::id()))
                    <form action="{{ route('group.leave', $group->id) }}" method="POST">
                        @csrf
                        <button type="submit" class="btn btn-primary">Leave Group</button>
                    </form>
                @elseif(Auth::check() && !$group->isMember(Auth::id()))
                    <form action="{{ route('group.join', $group->id) }}" method="POST">
                        @csrf
                        <button type="submit" class="btn btn-primary">Join Group</button>
                    </form>
                @endif
                @if(Auth::check() && $group->isAdmin(Auth::id()))
                    <form id="deleteGroupForm_{{$group->id}}" action="{{ route('group.delete', ['id' => $group->id]) }}" method="post">
                        @csrf
                        @method('DELETE')
                        <button type="button" class="btn btn-danger mt-1" onclick="confirmDeleteGroup('{{$group->id}}')">
                            Delete Group
                        </button>
                    </form>
                @endif
        </div>
        
    </div>
    <div class="line" style="margin: 20px 0; border-bottom: 1px solid #ccc;"></div>
    <div class="d-flex justify-content-between">
        <h4 class="mx-4">Posts</h4>
        @if( Auth::check() && $group->isMember(Auth::id()))
            <a href="{{ url('/post/create/' . $group->id) }}" class="btn btn-primary mx-3">Create Post</a>
        @endif
    </div>
    <div class="line" style="margin: 20px 0; border-bottom: 1px solid #ccc;"></div>

    <div class="container">
        @foreach ($group->posts as $post)
            @include('partials.post', ['post' => $post])
        @endforeach
        <div id="padding" class="text-center my-4">
            <p>No more posts</p>
        </div>
    </div>
</div>
@endsection

@section('rightbar')
    <div class="d-flex flex-column justify-content-between h-100">
        @include('partials.bar')
        <div id="bar-bottom" class="p-2 d-flex align-items-end">
            <ol class="breadcrumb d-flex flex-column align-items-end">
                <li class="breadcrumb-item text-white"><a href="/groups">Groups</a></li>
                <li class="breadcrumb-item active text-white">{{ $group->name }}</li>
            </ol>
            <img src="{{ $group->getPicture() }}" alt="{{ $group->name }}" class="img-thumbnail" width="100" height="100">
        </div>
    </div>
@endsection
