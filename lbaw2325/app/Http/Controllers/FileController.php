<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use \Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Models\Post;
use App\Models\Group;


class FileController extends Controller
{
    static $default = 'default.jpg';
    static $diskName = 'lbaw2023';

    static $systemTypes = [
        'profile' => ['png', 'jpg', 'jpeg', 'gif'],
        'post' => ['mp3', 'mp4', 'gif', 'png', 'jpg', 'jpeg'],
        'group' => ['png', 'jpg', 'jpeg', 'gif'],
    ];

    private static function isValidType(String $type) : bool {
        return array_key_exists($type, self::$systemTypes);
    }

    private static function defaultAsset(String $type) : String {
        return asset('resources/' . $type . '/' . self::$default);
    }
    
    private static function getFileName (String $type, int $id) : ?String {
            
        $fileName = null;
        switch($type) {
            case 'profile':
                $fileName = User::find($id)->img;
                break;
            case 'post':
                $fileName = Post::find($id)->picture;
                break;
            case 'group':
                $fileName = Group::find($id)->picture;
                break;
        }
        return $fileName;
    }
    
    static function get(String $type, int $userId) : String {
    
        // Validation: upload type
        if (!self::isValidType($type)) {
            return self::defaultAsset($type);
        }
    
        // Validation: file exists
        $fileName = self::getFileName($type, $userId);
        if ($fileName) {            
            return asset( 'resources/' . $type . '/' . $fileName);
        }
    
        // Not found: returns default asset
        return self::defaultAsset($type);
    }

    public static function delete(String $type, int $id) {
        $existingFileName = self::getFileName($type, $id);
        if ($existingFileName) {
            Storage::disk(self::$diskName)->delete($type . '/' . $existingFileName);

            switch($type) {
                case 'profile':
                    User::find($id)->profile_image = null;
                    break;
                case 'post':
                    Post::find($id)->picture = null;
                    break;
                case 'group':
                    Group::find($id)->picture = null;
                    break;
            }
        }
    }

    public static function store(String $type, int $id, $file) {
        // Validation: upload type
        if (!self::isValidType($type)) {
            return null;
        }
        // Validation: upload extension
        $extension = $file->extension();
        if (!in_array($extension, self::$systemTypes[$type])) {
            return null;
        }
        // Delete existing file
        self::delete($type, $id);

        // Generate unique filename
        $fileName = $file->hashName();

        // Store file
        $file->storeAs($type, $fileName, self::$diskName);

        // return file name
        return $fileName;
    }

    function upload(Request $request) : RedirectResponse {

        // Validation: has file
        if (!$request->hasFile('file')) {
            return redirect()->back()->with('error', 'Error: File not found');
        }

        // Validation: upload type
        if (!$this->isValidType($request->type)) {
            return redirect()->back()->with('error', 'Error: Unsupported upload type');
        }

        // Validation: upload extension
        $file = $request->file('file');
        $type = $request->type;
        $extension = $file->extension();
        if (!$this->isValidExtension($type, $extension)) {
            return redirect()->back()->with('error', 'Error: Unsupported upload extension');
        }

        // Prevent existing old files
        $this->delete($type, $request->id);

        // Generate unique filename
        $fileName = $file->hashName();

        // Validation: model
        $error = null;
        switch($request->type) {
            case 'profile':
                $user = User::findOrFail($request->id);
                if ($user) {
                    $user->profile_image = $fileName;
                    $user->save();
                } else {
                    $error = "unknown user";
                }
                break;

            case 'post':
                $post = Post::findOrFail($request->id);
                if ($post) {
                    $post->picture = $fileName;
                    $post->save();
                } else {
                    $error = "unknown post";
                }
                break;
            case 'group':
                $group = Group::findOrFail($request->id);
                if ($group) {
                    $group->picture = $fileName;
                    $group->save();
                } else {
                    $error = "unknown group";
                }
                break;

            default:
                redirect()->back()->with('error', 'Error: Unsupported upload object');
        }

        if ($error) {
            redirect()->back()->with('error', `Error: {$error}`);
        }

        $file->storeAs($type, $fileName, self::$diskName);
        return redirect()->back()->with('success', 'Success: upload completed!');
    }
    
}
