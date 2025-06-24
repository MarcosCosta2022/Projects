<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\View\View;  
use App\Models\User; // Import User model
use App\Models\Post; // Import Post model

use App\Models\Group; // Import Group model
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function ajaxSearch(Request $request)
    {
        $query = strtolower($request->get('query'));
        $users = User::whereRaw('LOWER(username) LIKE ?', ["%{$query}%"])
                    ->orWhereRaw('LOWER(first_name) LIKE ?', ["%{$query}%"])
                    ->orWhereRaw('LOWER(last_name) LIKE ?', ["%{$query}%"])
                    ->get(['id', 'username', 'first_name', 'last_name', 'img']);

        $posts = Post::whereRaw('LOWER(content) LIKE ?', ["%{$query}%"])
                   ->get(['id','content', 'id_user']);

        $groups = Group::whereRaw('LOWER(name) LIKE ?', ["%{$query}%"]) 
                    ->get(['id', 'name']);

        return response()->json($users, $posts, $groups);
    }

    public function search(Request $request)
    {
        $query = strtolower($request->get('query'));
        $users = User::whereRaw('LOWER(username) LIKE ?', ["%{$query}%"])
                    ->get(['id', 'username']);
        $posts = Post::whereRaw('LOWER(content) LIKE ?', ["%{$query}%"])
                    ->get(['id','content','id_user']);

        $groups = Group::whereRaw('LOWER(name) LIKE ?', ["%{$query}%"])  
                    ->get(['id', 'name' ]);

        return view('pages.search', ['users' => $users, 'posts' => $posts, 'groups' => $groups , 'query' => $query]);
    }
}
