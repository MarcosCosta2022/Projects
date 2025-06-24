<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\View\View;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;


use App\Models\Comment;
use App\Models\Reaction;
use App\Models\User;
use App\Models\Post;

class ReactionController extends Controller
{
    /**
     * React on a post.
     */
    public static function reactPost(?bool $liked, Post $post)
    {
        if (!Auth::check()) abort(401);

        $reaction = $post->reactions()->where('id_user', Auth::id())->first();

        if ($liked === null) {
            // If the reaction is null, delete the reaction.
            if ($reaction == null) return ;

            $m = NotificationController::deleteNotification( 'LikedPost' , $reaction );
            
            $reaction->delete();
            return "Deleted Notification";
        }

        // If the user has not reacted yet, create a new reaction.
        if ($reaction === null) {
            $reaction = new Reaction();
            $reaction->id_user = Auth::id();
            $reaction->reactiontype = 'ReactionPost';
            $reaction->id_post = $post->id;

        } else{
            // update the notification
            $m = NotificationController::deleteNotification( 'LikedPost' , $reaction );
        }

        // Update the reaction.
        $reaction->liked = $liked;
        $reaction->created_at = now();
        $reaction->save();

        // create the notification if reaction is liked and the user is not the owner of the post
        if ($liked && $post->id_user != Auth::id())
            $m = NotificationController::createNotification( 'LikedPost' , $reaction);
        else 
            $m = null;

        return $m;
    }

    /**
     * React on a comment.
     */
    public static function reactComment(?bool $liked, Comment $comment): void
    {
        if ($liked === null) {
            // If the reaction is null, delete the reaction.
            Reaction::where('id_user', Auth::id())->where('id_comment', $comment->id)->delete();
            return;
        }

        // Get the reaction of the current user on the comment.
        $reaction = $comment->reactions()->where('id_user', Auth::id())->first();

        // If the user has not reacted yet, create a new reaction.
        if ($reaction === null) {
            $reaction = new Reaction();
            $reaction->id_user = Auth::id();
            $reaction->reactiontype = 'ReactionComment';
            $reaction->id_comment = $comment->id;
        }

        // Update the reaction.
        $reaction->liked = $liked;
        $reaction->created_at = now();
        $reaction->save();
    }

    /**
     * List reactions.
     * 
     * @param string $id The id of the post or comment.
     * @param string $type The type of the reaction (Post or Comment).
     * @param bool|null $liked Whether the reactions are likes or dislikes.
     * @return JsonResponse The JsonResponse containing the reactions in json format.
     */
    public function list(string $id, string $type, ?bool $liked): JsonResponse
    {
        // get the model class name
        if ($type === 'Post') {
            $model = Post::class;
        } else if ($type === 'Comment') {
            $model = Comment::class;
        } else {
            abort(404);
        }

        // Get the model.
        $model = $model::findOrFail($id);

        // Check if the current user can see the model.
        $this->authorize('show', $model);

        // Get the reactions.
        if ($liked === null) {
            $reactions = $model->reactions;
        } else {
            $reactions = $model->reactions()->where('liked', $liked)->get();
        }

        // Return the reactions in json format.
        return response()->json($reactions);
    }

    /**
     * List the likes of a post.
     */
    public function listPostLikes(string $id): JsonResponse
    {
        // use the list method
        return $this->list($id, 'Post', true);
    }

    /**
     * List the dislikes of a post.
     */
    public function listPostDislikes(string $id): JsonResponse
    {
        // use the list method
        return $this->list($id, 'Post', false);
    }

    /**
     * List the likes of a comment.
     */
    public function listCommentLikes(string $id): JsonResponse
    {
        // use the list method
        return $this->list($id, 'Comment', true);
    }

    /**
     * List the dislikes of a comment.
     */
    public function listCommentDislikes(string $id): JsonResponse
    {
        // use the list method
        return $this->list($id, 'Comment', false);
    }


    /**
     * Like a post
     */
    public function likePost(string $id)
    {
        $post = Post::findOrFail($id);
        $this->authorize('show', $post);
        return $this->reactPost(true, $post);
    }

    /**
     * Dislike a post
     */
    public function dislikePost(string $id): void
    {
        $post = Post::findOrFail($id);
        $this->authorize('show', $post);
        $this->reactPost(false, $post);
    }

    /**
     * Like a comment
     */
    public function likeComment(string $id): void
    {
        $comment = Comment::findOrFail($id);
        $this->authorize('show', $comment);
        $this->reactComment(true, $comment);
    }

    /**
     * Dislike a comment
     */
    public function dislikeComment(string $id): void
    {
        $comment = Comment::findOrFail($id);
        $this->authorize('show', $comment);
        $this->reactComment(false, $comment);
    }

    /**
     * Remove reaction from a post
     */
    public function unreactPost(string $id)
    {
        $post = Post::findOrFail($id);
        $this->authorize('show', $post);
        // use the reactPost method
        return $this->reactPost(null, $post);
    }

    /**
     * Remove reaction from a comment
     */
    public function unreactComment(string $id): void
    {
        $comment = Comment::findOrFail($id);
        $this->authorize('show', $comment);
        $this->reactComment(null, $comment);
    }
}

?>
