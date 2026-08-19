<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Library;

$invalidLibs = Library::where('latitude', '>', 90)
    ->orWhere('latitude', '<', -90)
    ->orWhere('longitude', '>', 180)
    ->orWhere('longitude', '<', -180)
    ->get();

echo "FOUND " . $invalidLibs->count() . " LIBRARIES WITH INVALID LATITUDE/LONGITUDE:" . PHP_EOL;

foreach ($invalidLibs as $lib) {
    echo "Library ID {$lib->id} ('{$lib->name}'): lat={$lib->latitude}, long={$lib->longitude}" . PHP_EOL;
    $lib->update([
        'latitude' => null,
        'longitude' => null,
    ]);
    echo "  -> Cleaned latitude/longitude to null." . PHP_EOL;
}
echo "DONE SANITIZING DATABASE LATITUDE & LONGITUDE." . PHP_EOL;
