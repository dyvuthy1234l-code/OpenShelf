<?php

$cloudName = 'jsyajhtr';
$apiKey = '524473598627689';
$apiSecret = 'oBXG8v6i-3eXmqPISNcZVm2dIms';
$timestamp = time();
$signature = sha1('timestamp=' . $timestamp . $apiSecret);

$ch = curl_init('https://api.cloudinary.com/v1_1/' . $cloudName . '/image/upload');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'file' => 'https://picsum.photos/200',
    'api_key' => $apiKey,
    'timestamp' => $timestamp,
    'signature' => $signature,
]);

$response = curl_exec($ch);
curl_close($ch);
echo $response;


