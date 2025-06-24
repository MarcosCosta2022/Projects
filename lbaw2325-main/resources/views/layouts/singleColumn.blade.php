<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>{{ config('app.name', 'Laravel') }}</title>
        <!-- icon -->
        <link rel="icon" href="{{ url('icons/favicon.ico') }}" type="image/x-icon"/>

        <!-- Global Styles -->
        <link href="{{ url('css/app.css') }}" rel="stylesheet">
        <!-- Font Awesome -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
        <!-- Bootstrap (Make sure this is the correct path) -->
        <link href="{{ asset('css/bootstrap.min.css') }}" rel="stylesheet">

        

        <!-- Page Specific Styles -->
        @if (Request::is('user/*'))
            <link href="{{ url('css/profile.css') }}" rel="stylesheet">
        @endif
        @if (Request::is('user/*'))
            <link href="{{ url('css/home.css') }}" rel="stylesheet">
        @endif
        @if (Request::is('about'))
            <link href="{{ url('css/about.css') }}" rel="stylesheet">
        @endif
        @if (Request::is('contacts'))
            <link href="{{ url('css/contacts.css') }}" rel="stylesheet">
        @endif
        @if (Request::is('admin-dashboard'))
            <link href="{{ url('css/admin.css') }}" rel="stylesheet">
        @endif
        @if (Request::is('admin-dashboard/post/*'))
            <link href="{{ url('css/admin.css') }}" rel="stylesheet">
        @endif
        @if (Request::is('search'))
            <link href="{{ url('css/search.css') }}" rel="stylesheet">
        @endif
        @if (Request::is('notifications'))
            <link href="{{ url('css/notifications.css') }}" rel="stylesheet">
        @endif
        @if (Request::is('home') || Request::is('group/*'))
            <link href="{{ url('css/home.css') }}" rel="stylesheet">
        @endif
        @if (Request::is('groups'))
            <link href="{{ url('css/groups.css') }}" rel="stylesheet">
        @endif
        @if (Request::is('groups/*'))
            <link href="{{ url('css/groups.css') }}" rel="stylesheet">
        @endif
        @if (Request::is('post/*'))
            <link href="{{ url('css/post.css') }}" rel="stylesheet">
        @endif
        @if (Request::is('post/create'))
            <link href="{{ url('css/createPost.css') }}" rel="stylesheet">

        @endif
        @if (Request::is('register'))
        <link href="{{ url('css/register.css') }}" rel="stylesheet">
        @endif
        
        @if (Request::is('login'))
        <link href="{{ url('css/register.css') }}" rel="stylesheet">
        @endif


        <script type="text/javascript">
            // Fix for Firefox autofocus CSS bug
        </script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script type="text/javascript" src="{{ url('js/app.js') }}" defer></script>
        @if (Request::is('notifications'))
            <script type="text/javascript" src="{{ url('js/notifications.js') }}" defer></script>
        @endif
        @if (Request::is('admin-dashboard'))
        <script type="text/javascript" src="{{ url('js/admin.js') }}" defer></script>
        @endif
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous" defer></script>
    </head>
    <body class="container-fluid">
        @yield('content')
    </body>
</html>
