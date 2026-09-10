<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/register', [
            'username' => 'grandmaster_al',
            'name' => 'Alexander Alekhine',
            'email' => 'alekhine@chess.org',
            'password' => 'supersecret123',
            'password_confirmation' => 'supersecret123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'username',
                    'name',
                    'email',
                    'rating',
                    'avatar',
                    'created_at',
                ],
            ])
            ->assertJson([
                'user' => [
                    'username' => 'grandmaster_al',
                    'name' => 'Alexander Alekhine',
                    'email' => 'alekhine@chess.org',
                    'rating' => 1200,
                ],
            ]);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'username' => 'grandmaster_al',
            'email' => 'alekhine@chess.org',
            'rating' => 1200,
        ]);
    }

    public function test_registration_validation_fails_on_duplicate_username_or_invalid_password(): void
    {
        User::factory()->create([
            'username' => 'existing_user',
            'email' => 'existing@chess.org',
        ]);

        $response = $this->postJson('/api/register', [
            'username' => 'existing_user',
            'email' => 'other@chess.org',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username', 'password']);
    }

    public function test_user_can_login_with_username(): void
    {
        $user = User::factory()->create([
            'username' => 'capablanca',
            'email' => 'capa@chess.org',
            'password' => Hash::make('cuba1921'),
            'rating' => 1200,
        ]);

        $response = $this->postJson('/api/login', [
            'login' => 'capablanca',
            'password' => 'cuba1921',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Login successful.',
                'user' => [
                    'id' => $user->id,
                    'username' => 'capablanca',
                    'rating' => 1200,
                ],
            ]);

        $this->assertAuthenticatedAs($user);
    }

    public function test_user_can_login_with_email(): void
    {
        $user = User::factory()->create([
            'username' => 'fisher99',
            'email' => 'bobby@chess.org',
            'password' => Hash::make('reykjavik1972'),
        ]);

        $response = $this->postJson('/api/login', [
            'login' => 'bobby@chess.org',
            'password' => 'reykjavik1972',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'user' => [
                    'id' => $user->id,
                    'username' => 'fisher99',
                ],
            ]);

        $this->assertAuthenticatedAs($user);
    }

    public function test_user_cannot_login_with_incorrect_password(): void
    {
        User::factory()->create([
            'username' => 'kasparov',
            'password' => Hash::make('deepblue1997'),
        ]);

        $response = $this->postJson('/api/login', [
            'login' => 'kasparov',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['login']);

        $this->assertGuest();
    }

    public function test_authenticated_user_can_fetch_profile(): void
    {
        $user = User::factory()->create([
            'username' => 'carlsen',
            'rating' => 1200,
        ]);

        $response = $this->actingAs($user)->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJson([
                'user' => [
                    'id' => $user->id,
                    'username' => 'carlsen',
                    'rating' => 1200,
                ],
            ]);
    }

    public function test_unauthenticated_user_cannot_fetch_profile(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create([
            'username' => 'anand',
        ]);

        $response = $this->actingAs($user, 'web')->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Logged out successfully.',
            ]);

        $this->assertGuest('web');
    }
}
