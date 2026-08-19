<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Library extends Model
{
    use HasFactory;

    protected $appends = ['image_url', 'cover_image_url', 'is_auto_closed', 'operating_status', 'closing_time_label'];

    protected $fillable = [
        'owner_id',
        'name',
        'description',
        'image',
        'cover_image',
        'phone',
        'email',
        'address',
        'city',
        'rejection_reason',
        'opening_hours',
        'borrowing_rules',
        'borrowing_period_days',
        'fine_per_day',
        'max_books_per_member',
        'google_maps_url',
        'latitude',
        'longitude',
        'status',
    ];

    protected $casts = [
        'borrowing_period_days' => 'integer',
        'fine_per_day' => 'float',
        'max_books_per_member' => 'integer',
    ];

    public static function checkIsAutoClosed(?string $openingHours): array
    {
        if (!$openingHours) {
            return ['is_auto_closed' => false, 'closing_time' => null];
        }

        preg_match('/(?:-|to)\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)/i', $openingHours, $matches);
        
        if (!empty($matches[1])) {
            try {
                $closingTimeString = trim($matches[1]);
                $closingCarbon = \Illuminate\Support\Carbon::parse($closingTimeString);
                $now = \Illuminate\Support\Carbon::now();
                
                $closingToday = \Illuminate\Support\Carbon::today()
                    ->setHour($closingCarbon->hour)
                    ->setMinute($closingCarbon->minute);
                
                if ($now->greaterThanOrEqualTo($closingToday)) {
                    return [
                        'is_auto_closed' => true,
                        'closing_time' => $closingCarbon->format('g:i A'),
                    ];
                }
            } catch (\Throwable $e) {
                // Ignore parse failures
            }
        }

        return ['is_auto_closed' => false, 'closing_time' => null];
    }

    public function getIsAutoClosedAttribute(): bool
    {
        $check = static::checkIsAutoClosed($this->opening_hours);
        return $check['is_auto_closed'];
    }

    public function getClosingTimeLabelAttribute(): ?string
    {
        $check = static::checkIsAutoClosed($this->opening_hours);
        return $check['closing_time'];
    }

    public function getOperatingStatusAttribute(): string
    {
        if ($this->status === 'inactive') {
            return 'closed_manual';
        }
        if ($this->getIsAutoClosedAttribute()) {
            return 'closed_auto';
        }
        return 'open';
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function books()
    {
        return $this->hasMany(Book::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function borrowings()
    {
        return $this->hasMany(Borrowing::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) return null;
        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return $this->image;
        }
        $url = Storage::url($this->image);
        return str_starts_with($url, 'http') ? $url : url($url);
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
