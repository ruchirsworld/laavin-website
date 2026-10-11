<?php
// Enquiry form handler for contact.html. Emails the enquiry to the sales inbox and returns JSON.
header('Content-Type: application/json; charset=UTF-8');

$TO   = 'connect@laavinfra.com';
$FROM = 'website@laavinfra.com';

function reply($ok, $error = null, $code = 200) {
    http_response_code($code);
    echo json_encode($error ? ['ok' => $ok, 'error' => $error] : ['ok' => $ok]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply(false, 'Method not allowed', 405);
}

// Honeypot: bots fill every field, people never see this one.
if (!empty($_POST['website'])) {
    reply(true);
}

function field($key, $max = 200) {
    $v = trim((string)($_POST[$key] ?? ''));
    return mb_substr(str_replace(["\r", "\n"], ' ', $v), 0, $max);
}

$name    = field('name');
$email   = field('email');
$phone   = field('number', 40);
$service = field('service');
$org     = field('organization');
$location = field('location');
$message = mb_substr(trim((string)($_POST['message'] ?? '')), 0, 5000);

if ($name === '' || $phone === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    reply(false, 'Please fill in your name, a valid email and phone number.', 422);
}

$subject = 'Website enquiry: ' . ($service !== '' ? $service : 'General') . ': ' . $name;
$body = "New enquiry from laavinfra.com\n\n"
      . "Name:         $name\n"
      . "Email:        $email\n"
      . "Phone:        $phone\n"
      . "Service:      " . ($service ?: '-') . "\n"
      . "Organisation: " . ($org ?: '-') . "\n"
      . "Location:     " . ($location ?: '-') . "\n\n"
      . "Requirements:\n" . ($message ?: '-') . "\n\n"
      . "Sent " . date('d M Y, H:i') . " from " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

$headers = "From: Laavin Website <$FROM>\r\n"
         . "Reply-To: $name <$email>\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n";

if (!mail($TO, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, "-f$FROM")) {
    reply(false, 'Mail server error', 500);
}

reply(true);
