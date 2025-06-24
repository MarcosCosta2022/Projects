<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\View\View;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;


use App\Models\User;

use Illuminate\Support\Facades\DB;

class PasswordController extends Controller
{

    public function showChangePasswordForm(string $id): View
    {
        // Get the user.
        $user = User::findOrFail($id);

        // Check if the current user can update the user.
        $this->authorize('update', $user);  

        // Use the pages.user-edit template to display the user.
        return view('pages.changePasswordForm', [
            'user' => $user
        ]);
    }

    public function changePassword(string $id, Request $request)
    {
        // Get the user.
        $user = User::findOrFail($id);
        $profile = $user->profile;
        
        // Check if the current user can update the password.
        $this->authorize('update', $user);  

        // Validate the request data.
        $validated = $request->validate([
            'old_password' => 'required|string|min:8',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Check if the old password matches the user's current password.
        if (!Hash::check($validated['old_password'], $user->password)) {
            return redirect()->back()->withErrors(['old_password' => 'The old password is incorrect.']);
        }

        // Update the user's password.
        $user->password = bcrypt($validated['new_password']);
        $user->save();

        // Redirect to the user page.
        return redirect('/user/' . $user->id);
    }

    
}

?>
