<?php
require __DIR__ . '/vendor/autoload.php';

use Cloudinary\Cloudinary;

$cloudinary = new Cloudinary('cloudinary://524473598627689:oBXG8v6i-3eXmqPISNcZVm2dIms@jsyajhtr');

try {
    $result = $cloudinary->uploadApi()->upload('https://picsum.photos/200');
    echo "SUCCESS: " . json_encode($result);
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage();
}


