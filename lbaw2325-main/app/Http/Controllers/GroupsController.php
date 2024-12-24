<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\View\View;
use Illuminate\Support\Facades\Auth;
use App\Models\Group;

class GroupsController extends Controller
{
    // Display the form to create a new group
    public function createGroupForm()
    {
        return view('groups .create'); // Assuming you have a view file for creating groups
    }

    public function leaveGroup(string $id){
        $group = Group::findOrFail($id);
        $userId = auth()->id();
    
        // Check if the user is a member
        if (!$group->members()->where('id', $userId)->exists()) {
            return back()->with('error', 'You are not a member of this group.');
        }
    
        // Remove the user as a group member
        $group->members()->detach($userId);

        // check if there are no more members
        if ($group->members()->count() == 0) {
            $group->members()->detach();

            $group->posts()->delete();

            $group->delete();
            return redirect('/groups');
        }
        // check if there is a least one admin
        else if (!$group->members()->where('isgroupadmin', true)->exists()) {
            $group->members()->first()->pivot->isgroupadmin = true;
            $group->members()->first()->pivot->save();
        }


        return back()->with('success', 'You have left the group.');
    }

    // Store a new group in the database
    public function store(Request $request)
    {
        // validate the request...
        $validatedData = $request->validate([
            'name' => 'required|unique:groups|max:255',
            'description' => 'required',
        ]);

        $group = Group::create([
            'name' => $validatedData['name'],
            'description' => $validatedData['description'],
        ]);

        if ($request->hasFile('picture')) {
            $group->picture = FileController::store('group', $group->id, $request->file('picture'));
        }

        $group->save();

        $group->members()->attach(auth()->id(), ['isgroupadmin' => true]);

        // Additional logic, such as adding the creator as a member of the group

        return redirect('/groups');
    }



    public function index()
    {
        $groups = Group::all(); // Get all groups
        return view('groups .index', compact('groups')); // Pass groups to the view
    }

    public function delete($id){
        $group = Group::findOrFail($id);
    
        $group->members()->detach();

        $group->posts()->delete();

        $group->delete();
        return redirect('/groups');
    }


    public function joinGroup($groupId)
    {
        $group = Group::findOrFail($groupId);
        $userId = auth()->id();
    
        // Check if the user is already a member
        if ($group->members()->where('id', $userId)->exists()) {
            return back()->with('error', 'You are already a member of this group.');
        }
    // Add the user as a group member
    $group->members()->attach($userId, ['isgroupadmin' => false]);

    return back()->with('success', 'You have joined the group.');
}
//show a single group
public function show($id)
    {
        $group = Group::with(['members', 'posts']) // Assuming you have relations 'members' and 'posts'
                      ->findOrFail($id);

        return view('groups .show', compact('group'));
    }

}

