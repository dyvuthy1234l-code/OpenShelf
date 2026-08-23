<?php
require 'vendor/autoload.php';
use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;
Configuration::instance('cloudinary://344373826751911:Ukxlt0ykALh9OP1Jq0KKfN0A_xY@jsyajhtr');
$cloudinary = new Cloudinary();
try {
    $result = $cloudinary->uploadApi()->upload('https://picsum.photos/200');
    print_r($result);
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}

