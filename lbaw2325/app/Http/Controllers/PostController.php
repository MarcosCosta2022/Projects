<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\View\View;
use Illuminate\Support\Facades\Auth;

use App\Models\Report;
use App\Models\Post;

class PostController extends Controller
{
    public function show(string $id): View
    {
        // Get the post
        $post = Post::with('comments')->findOrFail($id);

        // Check if the current user can see (show) the post.
        $this->authorize('show', $post);

        // Use the pages.post template to display the post.
        return view('pages.post', [
            'post' => $post
        ]);
    }

    public function createPostForm($group_id = null)
    {
        return view('pages.createPost', ['group_id' => $group_id]);
    }
  //store post data
    public function store(Request $request){
        $formFields = $request->validate([
            'content' => 'required|max:2555',
            'visibility' => 'required_unless:forever,on|date',   
        ]);
    
        $post = new Post();
        $post->id_user = Auth::user()->id;
        $post->content = $request->content;
        $post->created_at = now();
    
        if ($request->has('group_id')) {
            $post->group_id = $request->group_id;
        }

        if ($request->has('forever')) {
            $post->visibility = null;
        } else {
            $post->visibility = $request->visibility;
        }

        $post->save();
        $post->refresh();

        if ($request->hasFile('picture')) {
            $post->picture = FileController::store('post', $post->id, $request->file('picture'));
        }

        $post->save();
       
        return redirect($request->has('group_id') ? '/group/' . $request->group_id : '/home');
    }

    // public function update(string $id, Request $request)
    // {
    //     // Get the post.
    //     $post = Post::findOrFail($id);

    //     // Check if the current user can update the post.
    //     $this->authorize('update', $post);

    //     // Validate the request data.
    //     $validated = $request->validate([
    //         'content' => 'required|string|max:255',
    //     ]);

    //     // Update the post.
    //     $post->title = $validated['title'];
    //     $post->content = $validated['content'];
    //     $post->save();

    //     // Redirect to the post page.
    //     return redirect('/post/' . $post->id);
    // }

    //show edit form 
    public function edit($id) {
        $post = Post::findOrFail($id);
        return view('pages.editPost', ['post' => $post]);
    }

    public function update($id, Request $request)
    {
        $post = Post::findOrFail($id);
        $user = Auth::user();
    
        // Check if the authenticated user is the owner of the post
        if ($post->id_user != Auth::id()) {
            // Handle unauthorized access
            abort(403, 'Unauthorized action.');
        }
    
        // Validate the request data
        $formFields = $request->validate([
            'content' => 'required|max:255',
            'visibility' => 'required_unless:forever,on|date',
        ]);
    
        // Update the post
        $post->content = $formFields['content'];
        if ($request->has('forever')) {
            $post->visibility = null;
        } else {
            $post->visibility = $request->visibility;
        }
        // Handle file upload
        if ($request->hasFile('picture')) {
            $file = $request->file('picture');
    
            // Delete the old picture if exists
            if ($post->pictur && Storage::disk('public')->exists($post->picture)) {
                Storage::disk('public')->delete($post->picture);
            }
    
            // Store the new picture
            $path = $file->store('posts', 'public');
            $post->picture = $path;
        }
    
        $post->save();
    
        return redirect('/home');
        }
    
    public function list(Request $request)
    {
        if (!Auth::check()) {
            return redirect('/login');
        } else {
            // The user is logged in.

            // Get cards for user ordered by id.
            $posts = Auth::user()->posts()->orderBy('id')->get();

            // Check if the current user can list the cards.
            $this->authorize('list', Post::class);

            // The current user is authorized to list cards.

            // Use the pages.cards template to display all cards.
            return view('pages.posts', [
                'posts' => $posts
            ]);
        }
    }

    //deltete post
    public function delete($id)
    {
        $post = Post::findOrFail($id);
      
        //Check if the authenticated user is the owner of the post
        if ($post->id_user != Auth::id() && Auth::user()->is_admin == false) {
           // Handle unauthorized access
           abort(403, 'Unauthorized action.');
        }

        // Delete the post picture if exists
        FileController::delete('post', $post->id);
        
        //delete reactions and comments
        $check = $post->group;

        $post->reactions()->delete();
        // delete the reactions for the comments
        foreach ($post->comments as $comment) {
            $comment->reactions()->delete();
        }
        $post->comments()->delete();

        // Delete the post and report
        $post->reports()->delete();
        $post->delete();

        if ($check) {
            return redirect('/group/' . $check->id);
        } else {
            return redirect()->back();
        }
    }

    //Method to report post
    public function report(string $id , Request $request)
    {
        $post = Post::findOrFail($id);
        $user = Auth::user();
    
        // Check if the authenticated user is the owner of the post
        if ($post->id_user == Auth::id()) {
            // Handle unauthorized access
            abort(403, 'Unauthorized action.');
        }
    
        // Check if the user has already reported the post
        if ($post->reports()->where('id_user', $user->id)->exists()) {
            
            return response('Can\'t report a single post more than once.', 406);
        }
    
        // Report the post
        $report = new Report();
        $report->id_user = $user->id;
        $report->id_post = $post->id;
        $report->created_at = now();
        $report->content = $request->content;
        $report->save();
    
        return redirect('/home');
    }

}
?>


