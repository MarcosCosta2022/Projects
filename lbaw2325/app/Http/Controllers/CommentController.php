<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\View\View;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

use App\Models\Comment;
use App\Models\Reaction;
use App\Models\User;
use App\Models\Post;

use Illuminate\Http\RedirectResponse;

class CommentController extends Controller
{
    /**
     * Show the comment in json format.
     *
     * @param string $id The comment id.
     * @return JsonResponse The JsonResponse containing the comment in json format.
     */
    public function show(string $id): JsonResponse
    {
        // Get the comment.
        $comment = Comment::findOrFail($id);

        // Check if the current user can see (show) the comment.
        $this->authorize('show', $comment);

        // Return the comment in json format.
        return response()->json($comment);
    }

    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'content' => 'required|string',

        ]);

        // Create a new comment
        $comment = new Comment([
            'content' => $request->input('content'),
            'created_at' => now(),
            'id_user' => Auth::id(),
        ]);


        try {
            $notification_outcome= NotificationController::createNotification('CommentNotification', $comment);
        } catch (\Throwable $th) {
            $notification_outcome = "Notification not created";
        }

        // Save the comment to the post
        $postId = $request->input('post_id');
        $post = Post::find($postId);
        $post->comments()->save($comment);

        // Redirect back or return a response
        return redirect()->back()->with('success', 'Comment added successfully!');
    }

    /**
     * Update the comment.
     *
     * @param string $id The comment id.
     * @param Request $request The request containing the new comment data.
     * @return JsonResponse The JsonResponse containing the updated comment in json format.
     */
    public function update(string $id, Request $request): JsonResponse
    {
        // Get the comment.
        $comment = Comment::findOrFail($id);

        // Check if the current user can update the comment.
        $this->authorize('update', $comment);

        // Validate the request data.
        $validated = $request->validate([
            'content' => 'required|string|max:255',
        ]);

        // Update the comment.
        $comment->content = $validated['content'];
        $comment->save();

        // Return the updated comment in json format.
        return response()->json($comment);
    }


    /**
     * Delete the comment.
     *
     * @param string $id The comment id.
     */
    public function delete(string $id)
    {
        // Get the comment.
        $comment = Comment::findOrFail($id);

        // Check if the current user can delete the comment.
        $this->authorize('delete', $comment);

        NotificationController::deleteNotification('CommentNotification', $comment);

        // Delete the comment.

        $comment->remove();

        // check if its a aJax request or not
        if (request()->ajax()) {
            return response()->json(['success' => 'Comment deleted successfully!']);
        } else {
            return redirect()->back()->with('success', 'Comment deleted successfully!');
        }
    }

    /**
     * Create a new comment.
     *
     * @param Request $request The request containing the new comment data.
     * @return JsonResponse The JsonResponse containing the created comment in json format.
     */
    public function create(string $postId , Request $request): JsonResponse|RedirectResponse
    {
        // check if post existes
        $post = Post::findOrFail($postId);

        // Validate the request data.
        $validated = $request->validate([
            'content' => 'required|string|max:255',
        ]);

        $this->authorize('comment', $post);

        // Create the comment.
        // not sure if it updates the timestamp
        $comment = new Comment();
        $comment->content = $validated['content'];
        $comment->id_post = $postId;
        $comment->id_user = Auth::id();
        $comment->created_at = now();
        $comment->save();

        // create notification if the user is not the owner of the post
        if ($post->id_user != Auth::id()) {
            try {
                $notification_outcome= NotificationController::createNotification('CommentNotification', $comment);
            } catch (\Throwable $th) {
                $notification_outcome = "Notification not created";
            }
        }else{
            $notification_outcome = "Notification not created";
        }

        // check if request is ajax
        if (request()->ajax()){
            $commentPartial = view('partials.comment', ['comment' => $comment])->render();

            // Return the generated HTML as a JSON response
            return response()->json(['comment_html' => $commentPartial , 'notification_outcome' => $notification_outcome]);
        }

        return redirect()->back()->with('success' , 'Comment created successfully.');
    }

    /**
     * List the comments of a post.
     *
     * @param string $id The post id.
     * @return JsonResponse The JsonResponse containing the comments in json format.
     */
    public function list(string $id): JsonResponse
    {
        // Get the post.
        $post = Post::findOrFail($id);

        // Check if the current user can see (show) the post.
        $this->authorize('show', $post);

        // Get the comments.
        $comments = $post->comments;

        // Return the comments in json format.
        return response()->json($comments);
    }

    /**
     * React to the comment.
     * 
     * @param string $id The comment id.
     * @param bool|null $liked Whether the comment is liked or disliked.
     * @return JsonResponse The JsonResponse containing the reacted comment in json format.
     */
    private function react(string $id, ?bool $liked): JsonResponse
    {
        // Get the comment.
        $comment = Comment::findOrFail($id);

        // Check if the current user can react to the comment.
        $this->authorize('react', $comment);

        // React to the comment.
        ReactionController::update($liked, 'ReactionComment', $comment->id);

        // Return the reacted comment in json format.
        return response()->json($comment);
    }


    /**
     * Like the comment.
     *
     * @param string $id The comment id.
     * @return JsonResponse The JsonResponse containing the liked comment in json format.
     */
    public function like(string $id): JsonResponse
    {
        // use the react function
        return $this->react($id, true);
    }

    /**
     * Dislike the comment.
     *
     * @param string $id The comment id.
     * @return JsonResponse The JsonResponse containing the disliked comment in json format.
     */
    public function dislike(string $id): JsonResponse
    {
        // use the react function
        return $this->react($id, false);
    }

    /**
     * Unlike the comment.
     *
     * @param string $id The comment id.
     * @return JsonResponse The JsonResponse containing the unliked comment in json format.
     */
    public function unlike(string $id): JsonResponse
    {
        // use the react function
        return $this->react($id, null);
    }

    /**
     * Undislike the comment.
     *
     * @param string $id The comment id.
     * @return JsonResponse The JsonResponse containing the undisliked comment in json format.
     */
    public function undislike(string $id): JsonResponse
    {
        // use the react function
        return $this->react($id, null);
    }

}

?>
