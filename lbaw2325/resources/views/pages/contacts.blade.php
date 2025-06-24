@extends('layouts.app')

@section('leftbar')
    @include('partials.leftbar')
@endsection

@section('page-title')
Contact Us
@endsection

@section('content')
<br> <br> <br>
<div class="container">
<div id="contacts" class="mt-4">
 

    <section class="team-section">
        <h2>Our Team</h2>
        <ul class="team-list">
            <li class="mb-3">
                <div class="team-info">
                    <h3>Anna-Lena Klöckner</h3>
                    <p>Email: up202302558@up.pt</p>
                </div>
            </li>
            <li class="mb-3">
                <div class="team-info">
                    <h3>Marcos Costa</h3>
                    <p>Email: up2021088692@edu.fe.up.pt</p>
                </div>
            </li>
            <li class="mb-3">
                <div class="team-info">
                    <h3>Tomás Silva</h3>
                    <p>Email: up202108698@edu.fe.up.pt</p>
                </div>
            </li>
        </ul>
    </section>
</div>
@endsection

@section('rightbar')
    @include('partials.bar')
@endsection
