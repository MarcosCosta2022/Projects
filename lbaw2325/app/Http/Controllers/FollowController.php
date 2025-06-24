<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;


class FollowController extends Controller
{
    
    //Follow a user
    public function follow($userId)
    {
        $followerId = Auth::user()->id;
        $followedUser = User::find($userId);

        if (!$followedUser) {
            return redirect()->back()->with('error', 'User not found.');
        }

        // Check if the user being followed has a private profile
        if ($followedUser->profilestate == 'private') {
            // Create a follow request for private profiles
            $follow = Follow::create([
                'followstate' => 'pending',
                'created_at' => now(),
                'id_follower' => $followerId,
                'id_followed' => $userId,
            ]);
        }
        else{

            // For public profiles, add a direct entry to the follow table
            $follow = Follow::updateOrCreate(
                [
                    'id_follower' => $followerId,
                    'id_followed' => $userId,
                ],
                [
                    'followstate' => 'public',
                    'created_at' => now(),
                    'id_follower' => $followerId,
                    'id_followed' => $userId,
                ]
            );
        }

        // create a notification
        NotificationController::createNotification('NewFollower', $follow);

        if ($followedUser->profilestate == 'private') {
            return redirect()->back()->with('message', 'Follow request sent.');
        }else {
            return redirect()->back()->with('message', 'User followed successfully.');
        }
    }

    // Unfollow a user
    public function unfollow($userId)
    {
        $followerId = auth()->user()->id;
    
        // Find the follow relationship
        $follow = Follow::where('id_follower', $followerId)
                        ->where('id_followed', $userId)
                        ->first();
    
        if ($follow) {
            // Delete the follow relationship
            Follow::where('id_follower', $follow->id_follower)
                  ->where('id_followed', $follow->id_followed)
                  ->delete();
    
            return redirect()->back()->with('message', 'Unfollowed successfully.');
        }
    
        return redirect()->back()->with('message', 'You were not following this user.');
    }


    // Accept a follow request
    public function acceptFollow($userId)
    {

        $followedUser = Auth::user()->id;
        $followerUser = $userId;

        Follow::where([
            'id_followed' => $followedUser,
            'id_follower' => $followerUser,
        ])->update(['followstate' => 'accepted']);
    
        return redirect()->back();
    }
    

    // Reject a follow request
    public function rejectFollow($userId)
    {   
        $followedUser = Auth::user()->id;
        $followerUser = $userId;

        Follow::where([
            'id_followed' => $followedUser,
            'id_follower' => $followerUser,
        ])->update(['followstate' => 'rejected']);
    
        return redirect()->back();
    }

    public function refollow($userId)
    {   
        $followedUser = $userId;
        $followerUser = Auth::user()->id;
        
        //get the correct row of follow table
        $follow = Follow::where([
            'id_followed' => $followedUser,
            'id_follower' => $followerUser,
        ])->first();

        Follow::where([
            'id_followed' => $followedUser,
            'id_follower' => $followerUser,
        ])->update(['followstate' => 'pending']);
        //delete previous notification
        NotificationController::deleteNotification('NewFollower', $follow);
        // create a notification
        NotificationController::createNotification('NewFollower', $follow);

        return redirect()->back();
    }

    public function cancelFollow($userId)
    {   
        $followedUser = $userId;
        $followerUser = Auth::user()->id;
        
        //get the correct row of follow table
        $follow = Follow::where([
            'id_followed' => $followedUser,
            'id_follower' => $followerUser,
        ])->first();

        //delete previous notification
        NotificationController::deleteNotification('NewFollower', $follow);

        //delete the row of the follow table
        Follow::where([
            'id_followed' => $followedUser,
            'id_follower' => $followerUser,
        ])->delete();


        return redirect()->back();
    }
}

?>