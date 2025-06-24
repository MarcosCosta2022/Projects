<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\View\View;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

use App\Models\User;

class FriendRequestController extends Controller
{
    /**
     * List all the friends of user with id *id*
     */
    public function allFriends(string $id){

        $user = User::findOrFail($id);

        $this->authorize('listAllFriends' , $user);

        $friends = $user->friends;

        return response()->json($friends);
    }

    /**
     * List all friend requests of a person *id*
     */
    public function list(string $id){
        $user = User::findOrFail($id);
        $this->authorize( 'listFriendRequests' ,$user);

        $friendRequests = $user->friendRequests;

        return response()->json($friendRequests);
    }

    /**
     * Accept a friend request *id*
     */
    public function accept(string $id){
        
    }

}

?>
