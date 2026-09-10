<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    /**
     * Test the /api/health endpoint returns successful status and connected database.
     */
    public function test_health_check_returns_successful_response(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'service',
                'database',
                'broadcasting',
                'timestamp',
            ])
            ->assertJson([
                'status' => 'healthy',
                'service' => 'chessmaster-api',
                'database' => 'connected',
            ]);
    }
}
