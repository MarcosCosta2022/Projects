@extends('layouts.app')

@section('leftbar')
    @include('partials.leftbar')
@endsection

@section('page-title')
Groups
@endsection

@section('content')

<div class="container my-4">
    <h1>Groups</h1>
    <a href="/groups/create" class="btn btn-success mb-4">Create New Group</a>

    <div class="list-group">
        @foreach ($groups as $group)
            <div class="group-list-item">
                <div class="d-flex align-items-start">
                    <img src="{{ $group->getPicture() }}" alt="{{ $group->name }}" class="group-image">
                    <div>
                        <h2 class="group-name"><a href="{{ route('group.show', $group->id) }}">{{ $group->name }}</a></h2>
                        <p class="group-description">{{ $group->description }}</p>
                    </div>
                </div>
                <div class="group-actions mt-3">
                    @if (!auth()->user()->groups->contains($group->id))
                        <form action="{{ route('group.join', $group->id) }}" method="POST">
                            @csrf
                            <button type="submit" class="btn btn-primary">Join Group</button>
                        </form>
                    @endif

                    @if (auth()->user()->adminGroups->contains($group->id))
                        <form id="deleteGroupForm_{{$group->id}}" action="{{ route('group.delete', ['id' => $group->id]) }}" method="post">
                            @csrf
                            @method('DELETE')
                            <button type="button" class="btn btn-danger" onclick="confirmDeleteGroup('{{$group->id}}')">
                                Delete Group
                            </button>
                        </form>
                    @endif
                </div>
            </div>
        @endforeach
    </div>
</div>


@endsection

@section('rightbar')
    @include('partials.bar')
@endsection

