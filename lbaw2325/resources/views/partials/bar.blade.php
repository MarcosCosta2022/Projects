
<div id="sidebar-top" class="p-3">  
    <div id ="searchbar">
        <form id="searchForm" action="/search" method="GET">
            <input type="search" id="searchInput" placeholder="Search users" name="query" class="form-control">
        </form>
        <div id="searchResults" class="list-group">


        </div>


    </div>   
</div>



@if (request()->is('groups*'))

<div id="sidebar-bottom" class="p-3">
    <h4>My Groups</h4>
    <div id="groups" class="list-group">
        @foreach (auth()->user()->groups as $group)
            <a href="{{ route('group.show', $group->id) }}" class="list-group-item list-group-item-action">
                {{ $group->name }}
            </a>
        @endforeach
    </div>
</div>

@endif