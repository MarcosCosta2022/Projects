<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\View\View;
use Illuminate\Support\Facades\Auth;

use App\Models\Report;
use App\Models\Post;
use App\Models\User;

use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /**
     * Display the admin dashboar page.
     *
     * @return \Illuminate\Http\Response
     */
    public function show()
    {
        if(!Auth::check()) 
        {
            return redirect('/login');
        }

        
        // Get all reported posts
        $reportedPosts = Post::reportedPostsOrder();
        

        // Count of total reports
        $totalReports = Report::distinct('id_post')->count('id_post');

        $everyUser = User::orderBy('username')->get();

        return view('pages.admin', [
            'reportedPosts' => $reportedPosts,
            'totalReports' => $totalReports,
            'users' => $everyUser,
        ]);
    }

    public function showPostReport(string $id): View
    {
        // Get the post
        $post = Post::with('reports')->findOrFail($id);

        // Check if the current user can see (show) the post.
        $this->authorize('show', $post);

        // Use the pages.post template to display the post.
        return view('pages.report', [
            'post' => $post
        ]);
    }


    // Function to delete all the lines of the report table related to a post
    public function deleteReports(string $id)
    {
        $post = Post::findOrFail($id);
        $post->reports()->delete();
        return redirect('/admin-dashboard');
    }

    /**
     * Make a user an admin
     */
    public function makeAdmin(string $id)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        $user = User::findOrFail($id);
        $user->is_admin = true;
        $user->save();
        return redirect('/admin-dashboard');
    }

    /**
     * Search for users
     */
    public function searchUsers(Request $request) : JsonResponse
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        if (!$request->has('search')) {
            abort(400);
        }

        $search = $request->input('search');

        if ($search == '') {
            $users = User::all();
        }
        else{
            $users = User::where('username', 'LIKE', "%{$search}%")
                ->orWhere('email', 'LIKE', "%{$search}%")
                ->orWhere('id', 'LIKE', "%{$search}%")
                ->get();
        }

        $html = view('admin.usercontainerview', [
            'users' => $users,
        ])->render();

        return response()->json([
            'html' => $html,
        ]);
    }

}
?>