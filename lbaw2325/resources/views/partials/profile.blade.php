
<section id="profile">
    <h2 class="d-none"> {{ $user->username }}'s Profile</h2>
    <section id="presentation" class="presentation-profile-card">
        <div class="profile-presentation">
            <div class="profile-presentation-text mt-3">
                <div id="profile-name" class="row align-items-center">
                    <div class="col-md-6">
                        <img src="{{ $user->getPicture() }}" alt="User profile picture" class="profile-picture">
                        <h2>&#64;{{ $user->username }}</h2>
                        <h3>{{ $user->first_name }} {{ $user->last_name }}</h3>
                    </div>
                    <div class="col-md-6 text-md-end">
                        @if(Auth::check() && Auth::user()->id !== $user->id)
                            @php
                                $followStatus = 'Follow';
                                $followState = null;
                                $follow = App\Models\Follow::where('id_followed', $user->id)
                                    ->where('id_follower', Auth::user()->id)
                                    ->first();

                                if($follow) {
                                    $followState = $follow->followstate;
                                    if($followState == 'public') {
                                        $followStatus = 'Unfollow';
                                    } elseif($followState == 'pending') {
                                        $followStatus = 'Follow Request Pending';
                                    }
                                }
                            @endphp
                            @if($followState == 'rejected')
                                {{-- The follow request was rejected --}}
                                <form action="{{ route('refollow', ['id' => $user->id]) }}" method="post" class="d-inline">
                                    @csrf
                                    <button type="submit" class="btn btn-primary mt-2">{{ $followStatus }}</button>
                                </form>
                            @elseif($followState == 'accepted' || $followState == 'public')
                                {{-- The authenticated user is already following the profile user --}}
                                <form action="{{ route('unfollow', ['id' => $user->id]) }}" method="post" class="d-inline">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-primary mt-2">Unfollow</button>
                                </form>
                            @elseif($followState == 'pending')
                                {{-- The follow request is pending --}}
                                <form action="{{ route('follow.cancel', ['id' => $user->id]) }}" method="post" class="d-inline">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-primary mt-2">Cancel Request</button>
                                </form>
                            @else
                                {{-- The follow request is not pending, display the Follow button --}}
                                <form action="{{ route('follow', ['id' => $user->id]) }}" method="post" class="d-inline">
                                    @csrf
                                    <button type="submit" class="btn btn-primary mt-2">{{ $followStatus }}</button>
                                </form>
                            @endif
                        @endif
                        @if (Auth::check() && ($user->id === Auth::user()->id || (Auth::user() && Auth::user()->is_admin)))
                            <a href="{{ url('/user/' . $user->id . '/edit') }}" class="btn btn-primary mt-2">Edit profile</a>
                        @endif
                        @if (Auth::check() && ((Auth::user()->is_admin && $user->id !== Auth::user()->id) || $user->id === Auth::user()->id))
                            <button id="btn-del-post" type="submit" class="btn btn-danger mt-2">Delete Account</button>
                        @endif
                        @if (Auth::check() && Auth::user()->id !== $user->id && Auth::user()->is_admin)
                            @if ($user->profilestate == 'blocked')
                                <form id="unblockForm" action="{{ route('user.unblock', $user->id) }}" method="POST" class="d-inline" onclick = "confirmUnblockProfile()">
                                    @csrf
                                    @method('POST')
                                    <button type = "button" class="btn btn-danger mt-2">Unblock Account</button>
                                </form>
                            @else
                                <form id="blockForm" action="{{ route('user.block', $user->id) }}" method="POST" class="d-inline" onclick = "confirmBlockProfile()">
                                    @csrf
                                    @method('POST')
                                    <button type = "button" class="btn btn-danger mt-2">Block Account</button>
                                </form>
                            @endif
                        @endif
                    </div>
                </div>
                <div id="profile-bio">
                    @foreach (explode("\n", $user->profile->bio) as $line)
                        <p>{{ $line }}</p>
                    @endforeach
                </div>
                <div class="row mt-3">
                    <div class="col-md-4">
                        <p>Followers: {{ $followersCount }}</p>
                    </div>
                    <div class="col-md-4">
                        <p>Following: {{ $followingCount }}</p>
                    </div>
                    <div class="col-md-4">
                        <p>Posts: {{ $postCount }}</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</section>

