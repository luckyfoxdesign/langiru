<?

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

$urlwords = htmlspecialchars($_GET["url"]);

if (isset($_GET['t'])) {
    $t = $_GET['t'];
} else {
    $t = 0;
}

function translateFromUrl($str)
{
    // Преобразование строки в нижний регистр
    $str = strtolower($str);

    $fromToMap = array(
        // Многобуквенные сочетания
        'yo' => 'ё', 'zh' => 'ж', 'kh' => 'х', 'ts' => 'ц', 'ch' => 'ч',
        'sh' => 'ш', 'shch' => 'щ', 'yu' => 'ю', 'ya' => 'я',

        // Однобуквенные соответствия
        'a' => 'а', 'b' => 'б', 'v' => 'в', 'g' => 'г', 'd' => 'д',
        'e' => 'е', 'z' => 'з', 'i' => 'и', 'j' => 'й', 'k' => 'к',
        'l' => 'л', 'm' => 'м', 'n' => 'н', 'o' => 'о', 'p' => 'п',
        'r' => 'р', 's' => 'с', 't' => 'т', 'u' => 'у', 'f' => 'ф',
        'y' => 'ы', 'e' => 'э'
    );

    // Замена многобуквенных сочетаний
    foreach ($fromToMap as $from => $to) {
        $str = str_replace($from, $to, $str);
    }

    // Возвращаем результат
    return $str;
}

$paramValue = $urlwords;

if ($t == 1) {
    $paramValue = translateFromUrl($urlwords);
}

// Передача данных в шаблон
echo $twig->render('not-found.twig', ['searchValue' => $paramValue]);

?>

