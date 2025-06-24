<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response()
    {
        // Make a GET request to the root URL
        $response = $this->get('/');

        // Assert that the response has a status code of 302 (redirect)
        $response->assertStatus(302);

        // Follow the redirect to the login page
        $response = $this->followRedirects($response);

        // Assert that the final response has a status code of 200 (success)
        $response->assertStatus(200);

        // Add more assertions as needed based on the behavior after the redirect
        // For example, you might assert that a specific view is rendered
        $response->assertViewIs('pages.login');
    }

    public function test_home_page_response()
    {
        // Make a GET request to the root URL
        $response = $this->get('/home');

        // Assert that the final response has a status code of 200 (success)
        $response->assertStatus(200);

        // Add more assertions as needed based on the behavior after the redirect
        // For example, you might assert that a specific view is rendered
        $response->assertViewIs('pages.home');
    }

    public function test_about_page_response()
    {
        // Make a GET request to the root URL
        $response = $this->get('/about');

        // Assert that the final response has a status code of 200 (success)
        $response->assertStatus(200);

        // Add more assertions as needed based on the behavior after the redirect
        // For example, you might assert that a specific view is rendered
        $response->assertViewIs('pages.about');
    }

    public function test_contacts_page_response()
    {
        // Make a GET request to the root URL
        $response = $this->get('/contacts');

        // Assert that the final response has a status code of 200 (success)
        $response->assertStatus(200);

        // Add more assertions as needed based on the behavior after the redirect
        // For example, you might assert that a specific view is rendered
        $response->assertViewIs('pages.contacts');
    }

    public function test_login_page_response()
    {
        // Make a GET request to the root URL
        $response = $this->get('/login');

        // Assert that the final response has a status code of 200 (success)
        $response->assertStatus(200);

        // Add more assertions as needed based on the behavior after the redirect
        // For example, you might assert that a specific view is rendered
        $response->assertViewIs('pages.login');
    }
}
