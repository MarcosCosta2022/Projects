@extends('layouts.app')

@section('leftbar')
    @include('partials.leftbar')
@endsection

@section('page-title')
About Us
@endsection

@section('content')
<div class="container mt-4">
  <br><br><br>

    <section id="description" class="mt-3">
        <h2>Thinker</h2>
        <p>Our project envisions the creation of a revolutionary social network that 
            will redefine the way people connect, share, and engage online. In an era 
            marked by increasing isolation and superficial digital interactions, our social 
            network will strive to foster genuine connections, empower users, and promote 
            positive social interactions.</p>
    </section>

    <section id="features" class="mt-3">
        <h2>Features</h2>

        <div class="feature">
            <div class="feature-content">
                <h3>Visibility</h3>
                <p>When making a new post, you will be able to select a custom visibility time. This
                    allows you to make a post that will only be visible for a 
                    certain amount of time.</p>
            </div>
        </div>

        <div class="feature">
            <div class="feature-content">
                <h3>Groups</h3>
                <p>You and all your friends will have the opportunity to create a group in which
                    you can make posts that will only be visible to the members of that group.</p>
            </div>
        </div>

        <!-- Add more features as needed -->

    </section>

    <section id="creators" class="mt-3">
        <h2>Creators</h2>
        <ul class="list-unstyled">
            <li>Anna-Lena Klöckner</li>
            <li>Marcos Costa</li>
            <li>Tomás Silva</li>
        </ul>
    </section>
</div>
@endsection

@section('rightbar')
    @include('partials.bar')
@endsection
