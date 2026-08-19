<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Waitlist extends Model
{
    protected $fillable = ['book_id', 'member_id', 'position'];
    public function book() { return $this->belongsTo(Book::class); }
    public function member() { return $this->belongsTo(User::class, 'member_id'); }
}
