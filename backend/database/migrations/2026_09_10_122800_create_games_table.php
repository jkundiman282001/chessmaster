<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->string('code', 16)->unique()->index();
            $table->foreignId('white_player_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('black_player_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('waiting')->index(); // waiting, in_progress, completed, aborted
            $table->string('fen', 128)->default('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
            $table->text('pgn')->nullable();
            $table->string('time_control', 32)->default('rapid_10_0'); // bullet_1_0, blitz_3_2, blitz_5_0, rapid_10_0, classical_30_0
            $table->integer('white_time_remaining')->default(600); // in seconds
            $table->integer('black_time_remaining')->default(600); // in seconds
            $table->string('turn', 8)->default('white'); // white, black
            $table->foreignId('winner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('end_reason', 32)->nullable(); // checkmate, resignation, timeout, stalemate, draw_agreement
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
