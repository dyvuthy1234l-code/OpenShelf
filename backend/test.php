<?php
\ = 'jsyajhtr';
\ = '344373826751911';
\ = 'Ukxlt0ykALh9OP1Jq0KKfN0A_xY';
\ = time();
\ = sha1('timestamp=' . \ . \);
\ = curl_init('https://api.cloudinary.com/v1_1/' . \ . '/image/upload');
curl_setopt(\, CURLOPT_RETURNTRANSFER, true);
curl_setopt(\, CURLOPT_POST, true);
curl_setopt(\, CURLOPT_POSTFIELDS, ['file' => 'https://picsum.photos/200', 'api_key' => \, 'timestamp' => \, 'signature' => \]);
\ = curl_exec(\);
echo \;

