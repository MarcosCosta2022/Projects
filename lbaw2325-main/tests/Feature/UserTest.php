<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;


class UserTest extends TestCase
{

    public function test_register_user()
    {
        $userData = [
            'firstname' => 'John',
            'lastname' => 'Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'secret1234',
            'password_confirmation' => 'secret1234',
            'birthdate' => '1999-01-01'
        ];

        $response = $this->post('/register', $userData);

        $response->assertStatus(302);
        $response->assertRedirect('/home');

        $this->assertAuthenticated();

        // Optionally, you can assert that the user is stored in the database
        $this->assertDatabaseHas('users', [
            'username' => 'johndoe',
            'email' => 'john@example.com',
        ]);
    }

    public function test_login_user()
    {
        $userData = [
            'email' => 'john@example.com',
            'password' => 'secret1234'
        ];

        $response = $this->post('/login', $userData);

        $response->assertStatus(302);
        $response->assertRedirect('/home');

        $this->assertAuthenticated();
    }

    public function test_edit_user()
    {
        // Assuming you have a user model
        $user = User::select('users.*')->where('username', 'johndoe')->first();

        // Acting as the authenticated user with a specific ID
        $response = $this->actingAs($user);

        $userData = [
            'firstname' => 'John',
            'lastname' => 'Doe',
            'bio' => 'I am a test user',
            'profilestate' => 'private'
        ];


        $response = $this->post("/user/{$user->id}/edit", $userData);

        $response->assertStatus(302);
        $response->assertRedirect("/user/{$user->id}");

        $this->assertAuthenticated();
    }

    public function test_show_user()
    {
        $user = User::select('users.*')->where('username', 'johndoe')->first();

        $response = $this->actingAs($user);

        $response = $this->get("/user/{$user->id}");

        $response->assertStatus(200);
        $response->assertViewIs('pages.user');
    }

    public function test_logout_user()
    {
        $response = $this->get('/logout');

        $response->assertStatus(302);
        $response->assertRedirect('/login');

        $this->assertGuest();
    }
    
    public function test_delete_user()
    {
        $user = User::select('users.*')->where('username', 'johndoe')->first();

        $response = $this->actingAs($user);

        $response = $this->delete("/user/{$user->id}/delete");

        $response->assertStatus(302);
        $response->assertRedirect("/");

        // check if its signed in
        $this->assertGuest();
    }
}