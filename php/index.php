<?php
include "connect.php";
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

// Здесь выполняется запрос к базе данных и обработка данных
// $query = "SELECT * FROM text WHERE orders = '1' ORDER BY id ASC LIMIT 3";
// // $query = "SELECT * FROM text WHERE orders = '1' ORDER BY RAND() LIMIT 3";
// $query_result = $db->query($query);
// $popular_words = [];

// while ($row = $query_result->fetch_assoc()) {
//     $popular_words[] = $row;
// }

// Передача данных в шаблон
echo $twig->render('index.twig');
?>
