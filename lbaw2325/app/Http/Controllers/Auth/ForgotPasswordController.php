<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

use Illuminate\View\View;

use App\Models\User;

use Illuminate\Support\Facades\Password;


class ForgotPasswordController extends Controller
{
    public function recover(){
        return view('auth.passwords.email');
    }

    public function sendResetLinkEmail(Request $request){
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? back()->with('status', __($status))
            : back()->withErrors(['email' => __($status)]);
    }

    // Handle successful response
    protected function sendResetLinkResponse($response)
    {
        return back()->with('status', trans($response));
    }

    // Handle failed response
    protected function sendResetLinkFailedResponse(Request $request, $response)
    {
        return back()->withErrors(
            ['email' => trans($response)]
        );
    }
}
