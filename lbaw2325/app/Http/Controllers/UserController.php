<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\View\View;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

use App\Models\User;

use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    
    public function show(string $id): View
    {
        // Get the user.
        $user = User::findOrFail($id);

        // Count followers
        $followersCount = $user->followers()->count();

        // Count following
        $followingCount = $user->followings()->count();

        // Post count acessing post table and counting posts with id_user = Auth::user()->id
        $postCount = $user->posts()->count();


        if (!$user) {
            // pass error message to view
            return redirect('/')->with('error', 'User not found');
        }

        // Check if the current user (can be not logged in) can see (show) the user.
        //$this->authorize('show', $user);

        // Use the pages.user template to display the user.
        return view('pages.user', [
            'user' => $user,
            'followersCount' => $followersCount,
            'followingCount' => $followingCount,
            'postCount' => $postCount,
        ]);
    }

    public function showEditForm(string $id): View
    {
        // Get the user.
        $user = User::findOrFail($id);

        // Check if the current user can update the user.
        $this->authorize('update', $user);  

        // Use the pages.user-edit template to display the user.
        return view('pages.editForm', [
            'user' => $user
        ]);
    }

    public function update(string $id, Request $request)
    {
        // Get the user.
        $user = User::findOrFail($id);
        $profile = $user->profile;
        // Check if the current user can update the user.
        $this->authorize('update', $user);  

        // Validate the request data.
        $validated = $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'bio' => 'required|string|max:255',
            'profilestate' => 'required|string|max:255',
            'picture' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        // Update the user.
        $user->first_name = $validated['firstname'];
        $user->last_name = $validated['lastname'];
        $profile->bio = $validated['bio'];
        $user->profilestate = $validated['profilestate'];

        if ($request->hasFile('picture')) {
            $user->img = FileController::store('profile', $user->id, $request->file('picture'));
        }

        $profile->save();
        $user->save();


        // Redirect to the user page.
        return redirect('/user/' . $user->id);
    }

    public function delete(string $id)
    {
        // Get the user.
        $user = User::findOrFail($id);
        // Get the profile.
        $profile = $user->profile;
        // Get the posts.
        $posts = $user->posts;


        // Check if the current user can delete the user.
        $this->authorize('delete', $user);  

        // Logout the user if he is logged in.
        if (Auth::check() && Auth::user()->id == $user->id) {
            Auth::logout();
        }

        //begin transaction
        DB::beginTransaction();

        // remove the user from every group he is in
        $groups = $user->groups;
        foreach($groups as $group){
            $group->members()->detach($user->id);
        }

        // Delete every follow related to the user
        $user->followings()->detach();
        $user->followers()->detach();

        // turn the id of the reactions of the user to null
        $reactions = $user->reactions;
        foreach($reactions as $reaction){
            $reaction->id_user = null;
            $reaction->save();
        }

        // set the id of the comments of the user to null
        $comments = $user->comments;
        foreach($comments as $comment){
            $comment->id_user = null;
            $comment->save();
        }

        //Nullify the foreign keys of the posts
        foreach($posts as $post){
            $post->id_user = null;
            $post->save();
        }
        //Delete the profile
        $profile->delete();
        
        // Delete the user.
        $user->delete();

        //commit transaction
        DB::commit();

        // Redirect to the home page.
        return back();
    }
    

    public function showapi(string $id): View
    {
        // Get the user.
        $user = User::findOrFail($id);

        // Check if the current user can see (show) the user.
        $this->authorize('show', $user);  

        // Use the pages.user template to display the user.
        return view('pages.user', [
            'user' => $user
        ]);
    }

    public function updateapi(string $id, Request $request)
    {
        // Get the user.
        $user = User::findOrFail($id);
        $profile = $user->profile;
        // Check if the current user can update the user.
        $this->authorize('update', $user);  

        // Validate the request data.
        $validated = $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'bio' => 'required|string|max:255',
        ]);

        // Update the user.
        $user->first_name = $validated['firstname'];
        $user->last_name = $validated['lastname'];
        $profile->bio = $validated['bio'];
        $profile->save();

        // Redirect to the user page.
        return redirect('/user/' . $user->id);
    }

    public function deleteapi(string $id)
    {
        // Get the user.
        $user = User::findOrFail($id);

        // Check if the current user can delete the user.
        $this->authorize('delete', $user);  

        // Delete the user.
        $user->delete();

        // Redirect to the home page.
        return redirect('/');
    }

    //method to block a user but not update page just change the button to unblock
    public function block(string $id)
    {
        // Get the user.
        $user = User::findOrFail($id);
        $profile = $user->profile;
        // Check if the current user can update the user.
        $this->authorize('block', $user);  

        // Update the user.
        $user->profilestate = 'blocked';
        $user->save();

        // Redirect to the user page.
        return redirect()->back();
    }

    //method to unblock a user but not update page just change the button to block
    public function unblock(string $id)
    {
        // Get the user.
        $user = User::findOrFail($id);
        $profile = $user->profile;
        // Check if the current user can update the user.
        $this->authorize('unblock', $user);  

        // Update the user.
        $user->profilestate = 'public';
        $user->save();

        // Redirect to the last page.
        return redirect()->back();
    }

    
}

?>
