<?
require_once 'vendor/autoload.php';

$loader = new \Twig\Loader\FilesystemLoader([
    './templates',
    './templates/components/',
    './templates/components/common',
]);
$twig = new \Twig\Environment($loader, [
    'cache' => './templates/cache/',
    'debug' => true,
]);

echo $twig->render('404.twig');
?>