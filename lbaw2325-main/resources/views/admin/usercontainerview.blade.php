@foreach ($users as $user)            
    @include('admin.userview', ['user' => $user])
@endforeach
<br>