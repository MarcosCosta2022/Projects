<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\View\View;

use App\Models\Post;    


class HomeController extends Controller
{
    /**
     * Display the home page.
     *
     * @return \Illuminate\Http\Response
     */
     public function index()
     {
         $posts = collect();
         $followings = collect();
         if (auth()->check()) {
             $user = auth()->user();
             $posts = $user->feed()->get();
             $followings = $user->followings; // Retrieve the users you are following
         } else {
             $posts = Post::publicPosts()->get();
         }
         return view('pages.home', [
            'posts' => $posts,
            'followings' => $followings
         ]);
}
}