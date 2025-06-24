
<div id='leftbar' class="container-fluid">
    <a href="{{ route('home') }}" id="logo_link" class="container-fluid" >
        <img src="{{ url('icons/logo.png') }}" alt="Thinker logo" class="bi me-2" width="40" height="32">
        <span class="fs-4">Thinker</span>
    </a>
    <ul class="nav nav-pills flex-column mb-auto mt-3">
        @if (Auth::check() && Auth::user()->is_admin)
            <li class="nav-item">
                <a href="/admin-dashboard" class="nav-link @if(Request::is('admin-dashboard')) active @endif">
                    <i class="fa-solid fa-crown fa-xl iframesicons"></i>  Admin Dashboard
                    @php
                        $reportCount = DB::table('report')->count();
                    @endphp
                    @if ($reportCount > 0)
                        <span class="badge bg-danger rounded-pill">{{ $reportCount }}</span>
                    @endif
                </a>                              
            </li>
        @endif
        @if (Auth::check())
            <li class="nav-item">
                <a href="/groups" class="nav-link @if(Request::is('groups')) active @endif">
                    <i class="fa-solid fa-user-group fa-xl iframesicons"></i> Groups
                </a>
            </li>
            <li class="nav-item">
                <a href="/notifications" class="nav-link @if(Request::is('notifications')) active @endif">
                    <i class="fa-solid fa-bell fa-xl iframesicons"></i> Notifications
                    @if (Auth::user()->unreadNotifications->count() > 0)
                        <span class="badge bg-danger rounded-pill mx-3">
                            @if (Auth::user()->unreadNotifications->count() > 99)
                                99+
                            @else
                                {{ Auth::user()->unreadNotifications->count() }}
                            @endif
                        </span>
                    @endif
                </a>
            </li>
        @else
            <li class="nav-item">
                <a href="{{ route('login') }}" class="nav-link @if(Request::is('login')) active @endif">
                    <i class="fa-solid fa-right-to-bracket fa-xl iframesicons"></i> Login
                </a>
            </li>
        @endif
        <li class="nav-item">
            <a href="/about" class="nav-link @if(Request::is('about')) active @endif">
                <i class="fa-solid fa-circle-info fa-xl iframesicons"></i> About us
            </a>
        </li>
        <li class="nav-item">
            <a href="/contacts" class="nav-link @if(Request::is('contacts')) active @endif">
                <i class="fa-solid fa-headset fa-xl iframesicons"></i> Contacts
            </a>
        </li>
        <li class="nav-item">
            <a href="/home" class="nav-link @if(Request::is('home')) active @endif">
                <i class="fa-solid fa-house fa-xl iframesicons"></i> Home
            </a>
        </li>
    </ul>


    <div id="sidebar-bottom" class="mt-auto p-3">
        @if (Auth::check())
            <div id="userinfo" class="d-flex align-items-center text-white text-decoration-none">
                <a href="{{ url('user/' . Auth::user()->id) }}" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
                    <img src="{{ Auth::user()->getPicture()}}" alt="User profile picture" class="rounded-circle me-2" width="40" height="40">
                    <span class="fs-5">{{ Auth::user()->username }}</span>
                </a>
                
                <ul class="m-0 p-0"><li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" id = "profilesettingbutton" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"></a>
                    <div class="dropdown-menu">
                        <a class="dropdown-item" href="{{ route('user.edit' , Auth::id())}}"><i class="fa-solid fa-user-pen"></i> Edit</a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="{{ url('user/' . Auth::user()->id . '/change-password') }}"><i class="fa-solid fa-gear"></i>     Change Password</a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="{{ route('logout') }}"><i class="fa-solid fa-arrow-right-from-bracket"></i>     Logout</a>
                    </div>
                </li></ul>
            </div>
        @endif
    </div>
</div>
