<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\View\View;
use Illuminate\Support\Facades\Auth;


use App\Models\Notification;

class NotificationController extends Controller
{


    static $notificationTypes = [
        'CommentNotification',
        'FriendRequestNotification' ,
        'NewFollower',
    ];

    public static function isTypeValid(String $type) : bool {
        return in_array($type, self::$notificationTypes);
    }

    private static function findNotification(String $type, $object ) : ?Notification {
        if ($type == 'CommentNotification') {
            return Notification::where('id_comment', $object->id)->where('notificationtype', $type)->first();
        } else if ( $type == 'LikedPost') {
            return Notification::where('id_reaction', $object->id)->where('notificationtype', $type)->first();
        } else if ( $type == 'NewFollower') {
            return Notification::where('id_follower', $object->id_follower)->where('id_user', $object->id_followed)->where('notificationtype', $type)->first();
        } else {
            return null;
        }
    }

    public function showNotificationsPage(Request $request)
    {
        if(!Auth::check()){
            return redirect()->route('login');
        }
        $user = Auth::user();
        
        if(request()->ajax()){
            $type = $request->type;
            if ($type == 'all') {
                $notifications = $user->notifications()->paginate(10);
            } else if ($type == 'new') {
                $notifications = $user->unreadNotifications()->paginate(10);
            } else if ($type == 'follows') {
                $notifications = $user->notifications()->where('notificationtype', 'NewFollower')->paginate(10);
            } else if ($type == 'likes') {
                $notifications = $user->notifications()->where('notificationtype', 'LikedPost')->paginate(10);
            } else if ($type == 'comments') {
                $notifications = $user->notifications()->where('notificationtype', 'CommentNotification')->paginate(10);
            } else {
                $notifications = $user->notifications()->paginate(10);
            }
            $notificationstab = view('notifications.tab', ['notifications' => $notifications])->render();
            $nextpageurl = $notifications->nextPageUrl();
            // add the type to the next page url
            if ($nextpageurl != null) {
                $nextpageurl = $nextpageurl . "&type=" . $type;
            }

            // return it in json format
            return response()->json(['html' => $notificationstab , 'next_page_url' => $nextpageurl]);
        }
        
        $notifications = $user->notifications()->paginate(10);

        // paginated unread notifications
        $unreadNotifications = $user->unreadNotifications()->paginate(10);

        // paginated like notifications
        $likeNotifications = $user->notifications()->where('notificationtype', 'LikedPost')->paginate(10);

        // paginated comment notifications
        $commentNotifications = $user->notifications()->where('notificationtype', 'CommentNotification')->paginate(10);

        // paginated follow notifications
        $followNotifications = $user->notifications()->where('notificationtype', 'NewFollower')->paginate(10);

        return view('pages.notifications', compact('notifications', 'unreadNotifications', 'likeNotifications', 'commentNotifications', 'followNotifications'));
    }

    public static function deleteNotification( $type , $object ): void
    {
        // check if the type is valid
        if (!self::isTypeValid($type)) {
            return ;
        }

        // find the notification
        $notification = self::findNotification($type, $object);

        // delete the notification
        if ($notification != null) {
            $notification->delete();
        }
    }


    public static function createNotification( $type , $object )
    {
        // check if the type is valid
        if (!self::isTypeValid($type)) {
            return  "Invalid type";
        }


        // find the notification
        $notification = self::findNotification($type, $object);

        // envelope everything in a try catch
        // create the notification
        if ($notification == null) {
            $notification = new Notification();
            if ($type == 'CommentNotification') {
                $notification->id_user = $object->post->id_user;
            } else if ( $type == 'LikedPost') {
                $notification->id_user = $object->place->id_user;
            } else if ( $type == 'NewFollower') {
                $notification->id_user = $object->id_followed;
            }
            $notification->notificationtype = $type;
            if ($type == 'CommentNotification') {
                $notification->id_comment = $object->id;
            } else if ( $type == 'LikedPost') {
                $notification->id_reaction = $object->id;
            } else if ( $type == 'NewFollower') {
                $notification->id_follower = $object->id_follower;
            }
            $notification->created_at = now();
            $notification->save();
            return "Notification created";
        }
        else{
            return "Notification already exists";
        }
    }

    public function delete(Request $request)
    {
        // check if has permission

        $notification = Notification::find($request->id);
        $this->authorize('delete', $notification);
        $notification->delete();
        return redirect()->back();
    }

    public function unread(string $id){

        $notification = Notification::find($id);
        // check if has permission

        $this->authorize('update', $notification);

        $notification->read = false;
        $notification->save();
        if (request()->ajax()) {
            return response()->json(['success' => 'Notification marked as unread']);
        }
        return redirect()->back();
    }

    public function read(string $id){

        $notification = Notification::find($id);
        // check if has permission
        $this->authorize('update', $notification);

        $notification->read = true;
        $notification->save();
        if (request()->ajax()) {
            return response()->json(['success' => 'Notification marked as read']);
        }
        return redirect()->back();
    }

    public function deleteAll(){
        $user = Auth::user();
        $notifications = $user->notifications();
        $notifications->delete();
        if (request()->ajax()) {
            return response()->json(['success' => 'All notifications deleted']);
        }
        return redirect()->back();
    }

    public function markAllAsRead(){
        $user = Auth::user();
        $notifications = $user->unreadNotifications();
        $notifications->update(['read' => true]);
        if (request()->ajax()) {
            return response()->json(['success' => 'All notifications marked as read']);
        }
        return redirect()->back();
    }

    


}
