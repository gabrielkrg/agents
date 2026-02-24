<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],

    'allowed_methods' => ['*'],

    /*
    | When supports_credentials is true, allowed_origins cannot be '*'.
    | The browser requires an explicit origin. We use APP_URL and optional
    | CORS_ALLOWED_ORIGINS for production, plus localhost for development.
    */
    'allowed_origins' => array_values(array_unique(array_filter(array_merge(
        [env('APP_URL')],
        explode(',', (string) env('CORS_ALLOWED_ORIGINS', '')),
        ['http://localhost', 'http://localhost:8000', 'http://localhost:3000', 'http://127.0.0.1', 'http://127.0.0.1:8000'],
    )))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
