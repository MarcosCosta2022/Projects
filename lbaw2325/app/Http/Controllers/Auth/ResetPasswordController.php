<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

use Illuminate\View\View;

use App\Models\User;

use Illuminate\Foundation\Auth\ResetsPasswords;

class ResetPasswordController extends Controller
{

    public function showResetForm(Request $request, $token = null): View
    {
        return view('auth.passwords.reset')->with(
            ['token' => $token, 'email' => $request->email]
        );
    }

    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email|exists:users,email',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return redirect()->back()->withErrors(['email' => 'Email not found']);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return redirect()->route('login')
            ->withSuccess('Password reset successfully!');
    }
}
