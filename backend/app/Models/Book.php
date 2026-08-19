<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Book extends Model
{
    use HasFactory;

    protected $appends = ['cover_image_url'];

    protected $fillable = [
        'library_id',
        'category_id',
        'title',
        'author',
        'isbn',
        'publisher',
        'publication_year',
        'description',
        'cover_image',
        'quantity',
        'available_quantity',
        'status',
    ];

    public function library()
    {
        return $this->belongsTo(Library::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function borrowings()
    {
        return $this->hasMany(Borrowing::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function getCoverImageUrlAttribute(): ?string
    {
        if (!$this->cover_image) return null;
        if (str_starts_with($this->cover_image, 'http://') || str_starts_with($this->cover_image, 'https://')) {
            return $this->cover_image;
        }
        $url = Storage::url($this->cover_image);
        return str_starts_with($url, 'http') ? $url : url($url);
    }
}
