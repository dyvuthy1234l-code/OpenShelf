<?php
require __DIR__ . '/vendor/autoload.php';

use Cloudinary\Cloudinary;

$cloudinary = new Cloudinary('cloudinary://344373826751911:Ukxlt0ykALh9OP1Jq0KKfN0A_xY@jsyajhtr');

try {
    $result = $cloudinary->uploadApi()->upload('https://picsum.photos/200');
    echo "SUCCESS: " . json_encode($result);
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage();
}


