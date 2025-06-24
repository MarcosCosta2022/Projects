@section ('profileBar')
<div id = "sidebar-top">
        <a href="{{ route('home') }}" id ="logo_link">
            <img src={{ url('icons/logo.png') }} alt="Thinker logo" width="68px" height="50px">
            <h1>Thinker</h1>
        </a>
        <div id ="searchbar"><input type="search" placeholder="Search"></div>
    </div>
    <div class="sidebar">

        <ul>
            @if (Auth::check())
            <li><a href="#" @if(Request::is('createpost')) id="currentPage" @endif>
                <img src={{ url('icons/createposticon.png') }} alt="Create Post Icon" width="30px" height="30px">
                <h2>Create Post </h2>
                </a>
            </li>
            <li><a href="#" @if(Request::is('groups')) id="currentPage" @endif>
                <img src={{ url('icons/groupicon.png') }} alt="Groups Icon" width="30px" height="30px">
                <h2>Groups </h2>
                </a>
            </li> 
            <li><a href="#" @if(Request::is('notifications')) id="currentPage" @endif>
                <img src={{ url('icons/notificationsicon.png') }} alt="Notifications Icon" width="30px" height="30px">
                <h2>Notifications </h2>
                </a>
            </li>
            @else
            <li>
                <a href="{{ route('login') }}" @if(Request::is('login')) id="currentPage" @endif>
                    <img src={{ url('icons/loginicon.png') }} alt="Login" width="30px" height="30px">
                    <h2>Login/Register </h2>
                </a>
            </li>
            @endif
            <li>
                <a href="#" @if(Request::is('about-us')) id="currentPage" @endif>
                <img src={{ url('icons/aboutusicon.png') }} alt="About us Icon" width="30px" height="30px">
                <h2>About us </h2>
                </a>
            </li>
            <li><a href="#"  @if(Request::is('contacts')) id="currentPage" @endif>
                <img src={{ url('icons/contactsicon.png') }} alt="Contacts Icon" width="30px" height="30px">
                <h2>Contacts </h2>
                </a>
            </li>
            <li><a href="/home"  class="l" @if(Request::is('home')) id="currentPage" @endif>
                <img src={{ url('icons/homeicon.png') }} alt="Home Icon" width="30px" height="30px">
                <h2>Home </h2>
                </a>
            </li>
        </ul>
    </div>
@endsection