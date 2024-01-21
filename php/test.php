<?php
// ... PHP код ...

require_once 'vendor/autoload.php';

$loader = new \Twig\Loader\FilesystemLoader('/var/www/html/templates/');
$twig = new \Twig\Environment($loader, [
    'cache' => '/var/www/html/templates/cache/',
    'debug' => true,
]);

// Отображаем Twig шаблон
echo $twig->render('test.twig'); // Используйте основной шаблон, который включает test.twig
?>
