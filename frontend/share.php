<?php
/**
 * share.php
 * Diakses via .htaccess rewrite khusus untuk bot crawler (WA/FB/Twitter/dll)
 * pas mereka hit /berita/:slug. Fetch data artikel dari backend API,
 * generate og:meta statis, lalu redirect ke halaman SPA asli.
 */

$slug = isset($_GET['slug']) ? $_GET['slug'] : '';
$backendApi = 'https://backend.man3kulonprogo.sch.id/api';
$backendOrigin = 'https://backend.man3kulonprogo.sch.id';
$frontendUrl = 'https://man3kulonprogo.sch.id';

function escapeHtml($str) {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

$targetUrl = $frontendUrl . '/berita/' . $slug;

if (empty($slug)) {
    header('Location: ' . $frontendUrl . '/berita');
    exit;
}

$ch = curl_init($backendApi . '/articles/' . urlencode($slug));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$response) {
    header('Location: ' . $targetUrl);
    exit;
}

$article = json_decode($response, true);

if (!$article || !isset($article['title'])) {
    header('Location: ' . $targetUrl);
    exit;
}

$title = escapeHtml($article['title']);
$description = escapeHtml(substr($article['overview'] ?? '', 0, 160));

$coverImageRaw = $article['coverImage'] ?? '';
if (empty($coverImageRaw)) {
    $coverImage = $frontendUrl . '/logo.png';
} elseif (preg_match('/^https?:\/\//i', $coverImageRaw)) {
    $coverImage = $coverImageRaw;
} else {
    $path = (strpos($coverImageRaw, '/') === 0) ? $coverImageRaw : '/' . $coverImageRaw;
    $coverImage = $backendOrigin . $path;
}

$safeCoverImage = escapeHtml($coverImage);
$safeTargetUrl = escapeHtml($targetUrl);
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<title><?php echo $title; ?></title>
<meta property="og:title" content="<?php echo $title; ?>" />
<meta property="og:description" content="<?php echo $description; ?>" />
<meta property="og:image" content="<?php echo $safeCoverImage; ?>" />
<meta property="og:url" content="<?php echo $safeTargetUrl; ?>" />
<meta property="og:type" content="article" />
<meta name="twitter:card" content="summary_large_image" />
</head>
<body>
<p>Mengalihkan ke <a href="<?php echo $safeTargetUrl; ?>"><?php echo $safeTargetUrl; ?></a>...</p>
</body>
</html>