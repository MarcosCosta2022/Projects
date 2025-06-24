<div class="userCard card">
    <div class="card-body d-flex align-items-center">
        <a href="{{ url('/user/' . $user->id) }}" class="text-decoration-none text-black mx-2">
            <img src="{{ $user->getPicture() }}" alt="{{ $user->username }}" class="rounded-circle m-2" style="height: 50px ; width:50px;">
        </a>
        <a href="{{ url('/user/' . $user->id) }}" class="text-decoration-none text-black mx-2">
            <h5> {{ $user->username }} </h5>
            @if ($user->is_admin)
            <h6> (Admin) </h6>
            @endif
        </a>
        <div class="ml-auto d-flex" style="margin-left: auto;">
            @if ($user->isBlocked())
            <form action="{{ route('user.unblock' , $user->id) }}" method="POST" id="unblockForm_{{$user->id}}">
                @csrf
                <button type="button" class="btn btn-success mx-1" data-toggle="tooltip" data-placement="top" title="Unblock User" onclick="confirmUnblockAdminDash('{{$user->id}}')">
                    <i class="fas fa-user-check"></i>
                </button>
            </form>
            @else
            <form action="{{ route('user.block', $user->id) }}" method="POST" id="blockForm_{{$user->id}}">
                @csrf
                <button type="button" class="btn btn-danger mx-1" data-toggle="tooltip" data-placement="top" title="Block User" onclick="confirmBlockAdminDash('{{$user->id}}')">
                    <i class="fas fa-user-slash"></i>
                </button>
            </form>            
            @endif
            <form action="{{ route('user.delete', $user->id) }}" method="POST" id="deleteForm_{{$user->id}}">
                @csrf
                @method('DELETE')
                <button type="button" class="btn btn-danger mx-1" data-toggle="tooltip" data-placement="top" title="Delete User" onclick="confirmDeleteAdminDash('{{$user->id}}')">
                    <i class="fas fa-trash"></i>
                </button>
            </form>
            @if (!$user->is_admin)
            <form action="{{ route('user.makeadmin', $user->id) }}" method="POST" id="makeAdminForm_{{$user->id}}">
                @csrf
                <button type="button" class="btn btn-primary mx-1" data-toggle="tooltip" data-placement="top" title="Make an admin" onclick="confirmAdminAdminDash('{{$user->id}}')">
                    <i class="fas fa-user-shield"></i>
                </button>
            </form>
            @endif
            <a href="{{ url('/user/' . $user->id . '/edit') }}" class="btn btn-primary mx-1" data-toggle="tooltip" data-placement="top" title="Edit User">
                <i class="fas fa-user-edit"></i>
            </a>
        </div>



    </div>
</div>