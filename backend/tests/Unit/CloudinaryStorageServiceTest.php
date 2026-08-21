<?php

namespace Tests\Unit;

use App\Services\CloudinaryStorageService;
use PHPUnit\Framework\TestCase;

class CloudinaryStorageServiceTest extends TestCase
{
    public function test_extracts_public_id_from_cloudinary_urls(): void
    {
        $urlWithVersion = 'https://res.cloudinary.com/demo/image/upload/v1612345678/openshelf/avatars/sample.jpg';
        $publicId = CloudinaryStorageService::getPublicIdFromUrl($urlWithVersion);
        $this->assertEquals('openshelf/avatars/sample', $publicId);

        $urlWithoutVersion = 'https://res.cloudinary.com/demo/image/upload/openshelf/books/book_cover.png';
        $publicId2 = CloudinaryStorageService::getPublicIdFromUrl($urlWithoutVersion);
        $this->assertEquals('openshelf/books/book_cover', $publicId2);

        $invalidUrl = 'https://example.com/images/avatar.jpg';
        $publicId3 = CloudinaryStorageService::getPublicIdFromUrl($invalidUrl);
        $this->assertNull($publicId3);
    }
}
