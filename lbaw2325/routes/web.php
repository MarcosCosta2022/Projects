<?php

use Illuminate\Support\Facades\Route;

// TODO : add the controllers
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\StaticPageController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\FriendRequestController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\GroupsController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;

use App\Http\Controllers\PasswordController;




/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/


Route::redirect('/', '/login');
Route::get('/home', [HomeController::class, 'index'])->name('home');

// Static pages
Route::get('/about', [StaticPageController::class, 'about'])->name('about');
Route::get('/contacts', [StaticPageController::class, 'contacts'])->name('contacts');

// Authentication
Route::controller(LoginController::class)->group(function () {
    Route::get('/login', 'showLoginForm')->name('login');
    Route::post('/login', 'authenticate');
    Route::get('/logout', 'logout')->name('logout');
});

Route::controller(ForgotPasswordController::class)->group(function(){
    Route::get('/recover-password' , 'recover' )->name('password.request');
    Route::post('/recover-password', 'sendResetLinkEmail')->name('password.email');
});

Route::controller(ResetPasswordController::class)->group(function(){
    Route::get('/reset-password/{token}', 'showResetForm')->name('password.reset');
    Route::post('/reset-password', 'reset')->name('password.update');
});

Route::controller(RegisterController::class)->group(function () {
    Route::get('/register', 'showRegistrationForm')->name('register');
    Route::post('/register', 'register');
});

Route::controller(PasswordController::class)->group(function () {
    Route::get('/user/{id}/change-password', 'showChangePasswordForm')->name('user.changePasswordForm');
    Route::post('/user/{id}/change-password', 'changePassword')->name('user.changePassword');
});

// Users
Route::controller(UserController::class)->group(function () {
    Route::get('/user/{id}', 'show')->where('id', '[0-9]+')->name('user.show');
    Route::get('/user/{id}/edit', 'showEditForm');
    Route::post('/user/{id}/edit', 'update')->name('user.edit');
    Route::delete('/user/{id}/delete', 'delete')->name('user.delete');
    Route::post('user/{id}/block', 'block')->name('user.block');
    Route::post('user/{id}/unblock', 'unblock')->name('user.unblock');
});



// Posts
Route::controller(PostController::class)->group(function () {
    Route::get('/post/create', 'createPostForm')->name('createPostForm');
    Route::post('/post/create', 'store')->name('post.create');
    Route::get('/post/{id}/edit', 'edit')->name('editPostForm');
    Route::get('/post/{id}', 'show')->name('showPost');
    Route::put('/post/{id}', 'update');
    Route::delete('/post/{id}', 'delete');
    Route::post('/post/{id}/report', 'report')->name('reportPost');
    Route::get('/post/create/{group_id}', 'createPostForm')->name('createPostFormWithGroup');
});



//Groups
Route::controller(GroupsController::class)->group(function () {
    Route::get('/groups/create', 'createGroupForm')->name('createGroupForm');
    Route::post('/groups', 'store')->name('groups.store');
    Route::get('/groups', 'index')->name('groups.index');
    Route::delete('/group/{id}/delete', 'delete')->name('group.delete');
    Route::post('/group/join/{group}', 'joinGroup')->name('group.join');
    Route::get('/group/{group}', 'show')->name('group.show');
    Route::post('/group/{group}/leave', 'leaveGroup')->name('group.leave');

    // Add other routes for viewing, editing, and deleting groups
});

// Search
Route::get('/ajax-search-users', [SearchController::class, 'ajaxSearch'])->name('ajax.search.users');
Route::get('/search', [SearchController::class, 'search'])->name('search');


// Comments


// Admin
Route::controller(AdminController::class)->group(function () {
    Route::get('/admin-dashboard', 'show')->name('showAdminDashboard');
    Route::get('/admin-dashboard/post/{id}', 'showPostReport')->name('showReports');
    Route::delete('/admin-dashboard/post/{id}/reports', 'deleteReports')->name('deleteReports');
    Route::post('/user/{id}/admin', 'makeAdmin')->name('user.makeadmin');
    Route::get('/admin/search/users', 'searchUsers');
});



// Follow
Route::controller(FollowController::class)->group(function () {
    Route::post('/user/{id}/follow', 'follow')->name('follow');
    Route::post('/user/{id}/refollow', 'refollow')->name('refollow');
    Route::delete('/user/{id}/unfollow', 'unfollow')->name('unfollow');
    Route::post('/follow/request/user/{id}/accept', 'acceptFollow')->name('follow.accept');
    Route::post('/follow/request/user/{id}/reject', 'rejectFollow')->name('follow.reject');
    Route::delete('/follow/request/user/{id}/cancel', 'cancelFollow')->name('follow.cancel');
});

// API

// Comments
Route::controller(CommentController::class)->group(function () {
    Route::get('/api/comment/{id}', 'show');
    Route::put('/api/comment/{id}', 'update');
    Route::delete('/api/comment/{id}', 'delete')->name('comment.delete');
    Route::post('/api/post/{id}/comment', 'create') -> name('comment.create');
    Route::get('/api/post/{id}/comments', 'list')-> name('comment.list');
});

// Reactions
Route::controller(ReactionController::class)->group(function () {
    Route::get('/api/post/{id}/likes', 'listPostLikes');
    Route::get('/api/post/{id}/dislikes', 'showPostDislikes');
    Route::get('/api/comment/{id}/likes', 'showCommentLikes');
    Route::get('/api/comment/{id}/dislikes', 'showCommentDislikes');
    Route::get('/post/{id}/like' , 'likePost');
    Route::get('/post/{id}/dislike' , 'dislikePost');
    Route::delete('/post/{id}/unlike' , 'unreactPost');
    Route::delete('/post/{id}/undislike' , 'unreactPost');
    Route::get('/api/comment/{id}/like', 'likeComment');
    Route::get('/api/comment/{id}/dislike', 'dislikeComment');
    Route::delete('/api/comment/{id}/unlike', 'unreactComment');
    Route::delete('/api/comment/{id}/undislike', 'unreactComment');
});


//  Notifications

Route::controller(NotificationController::class)->group(function () {
    Route::get('/notifications', 'showNotificationsPage');
    Route::get('/notification/{id}', 'showNotification')->name('showNotification');
    Route::get('/api/notifications', 'list');
    Route::get('/api/notification/{id}', 'show');
    Route::delete('/api/notification/{id}', 'delete')->name('notification.delete');
    Route::get('/api/notification/{id}/read', 'read')->name('notification.markAsRead');
    Route::get('/api/notification/{id}/unread', 'unread')->name('notification.markAsNotRead');
    Route::delete('/api/notifications', 'deleteAll')->name('notification.deleteAll');
    Route::get('/api/notifications/read', 'markAllAsRead')->name('notification.markAllAsRead');
});

// Friends
Route::controller(FriendRequestController::class)->group(function () {
    Route::get('/api/user/{id}/friends' , 'allFriends');
    Route::get('/api/user/{id}/friendrequests', 'list');
    Route::get('/api/user/{id}/acceptFriendRequest' , 'accept');
    Route::get('/api/friendrequest/{id}/reject', 'reject');
    Route::get('/api/friendrequest/{id}/cancel', 'cancel');
    Route::delete('/api/friendrequest/{id}/delete', 'delete');
    Route::get('/api/user/{id}/friendrequest', 'send');
});

// Follows

Route::controller(FollowController::class)->group(function () {
    Route::get('/api/follows', 'list');
    Route::get('/api/user/{id}/follow', 'follow');
    Route::get('/api/user/{id}/unfollow', 'unfollow');
});


Route::post('/file/upload', [FileController::class, 'upload']);
