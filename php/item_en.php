<?
include "connect.php";
include "utils/utils.php";

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

$stmt = $db->prepare("SELECT * FROM text WHERE entext = ? AND orders = 1 LIMIT 1");
$stmt->bind_param("s", $urlwords);
$isQuerySuccssfull = $stmt->execute();

if ($isQuerySuccssfull) {
    $query_result = $stmt->get_result();
    $results_arr = $query_result->fetch_assoc();

    if (!$results_arr || !isset($results_arr['entext'])) {
        $rl = urlencode($urlwords);
        $str = "Location: /$rl-not-found";
        header($str);
        exit;
    }
    $search_value = $results_arr['entext'];
    $searchword_ru = $results_arr['rutext'];
    $searchenhash = $results_arr['hashen'];
    $rutooltip = $results_arr['rutooltip'];
    $searchentext = $results_arr['entext'];
} else {
    // Handle error
    echo "Error executing query: " . $db->error;
}

$stmtText = $db->prepare("
    SELECT t1.hashru AS hashrut, t1.entext, t1.rutext, t1.hashen, t1.rutooltip, MIN(t1.id) AS min_id
    FROM text AS t1
    LEFT JOIN enmean AS t2 ON t1.hashen = t2.hashin
    WHERE t1.hashen = ?
    GROUP BY t1.rutext, t1.hashru, t1.entext, t1.hashen, t1.rutooltip
    ORDER BY MIN(t1.id) ASC
    LIMIT 3
");

$searchwordhash = md5($search_value);
$stmtText->bind_param("s", $searchwordhash);
$stmtText->execute();
$resultText = $stmtText->get_result();

$text_entries = [];

while ($exrow = $resultText->fetch_assoc()) {
    $hashen = $exrow['hashen'];
    $hashru = $exrow['hashrut'];
    $entext_example = $exrow['entext'];

    $examplesData = [];

    $stmtExamples = $db->prepare("SELECT * FROM examples WHERE hashen = ? AND hashru = ? ORDER BY id LIMIT 3");
    $stmtExamples->bind_param("ss", $hashen, $hashru);
    $stmtExamples->execute();
    $resultExamples = $stmtExamples->get_result();

    while ($exrowsub = $resultExamples->fetch_assoc()) {
        // $dst = str_replace("<", '<span class="blue">', $exrowsub['dst']);
        // $src = str_replace("<", '<span class="blue">', $exrowsub['src']);
        // $dst = str_replace(">", '</span>', $dst);
        // $src = str_replace(">", '</span>', $src);

        $wordsAndSentencesExamplesArr = extractSentenceParts($exrowsub['dst']);
        $frasesAndSentencesExamplesArr = extractSentenceParts($exrowsub['src']);

        // $pos = strpos($dst, $entext_example);

        // if ($pos !== false) {
        //     $examplesData[] = [
        //         'dst' => $dst,
        //         'src' => $src,
        //     ];
        // }
        $examplesData[] = [
            'dst' => $wordsAndSentencesExamplesArr,
            'src' => $frasesAndSentencesExamplesArr,
        ];
    }

    $text_entries[] = [
        'rutext' => $exrow['rutext'],
        'rutooltip' => $exrow['rutooltip'],
        'examples' => $examplesData,
    ];
}

$stmtEnex = $db->prepare("SELECT * FROM enex WHERE hashin LIKE ? LIMIT 3");
$paramEnex = "%" . $searchenhash . "%";
$stmtEnex->bind_param("s", $paramEnex);
$stmtEnex->execute();
$resultEnex = $stmtEnex->get_result();

$enexEntries = [];

while ($exrow = $resultEnex->fetch_assoc()) {
    $hashenq = $exrow['hashin'];
    $hashruq = $exrow['hashout'];

    $examplesData = [];

    $stmtExamples = $db->prepare("SELECT * FROM examples WHERE hashen = ? AND hashru = ? ORDER BY id");
    $stmtExamples->bind_param("ss", $hashenq, $hashruq);
    $stmtExamples->execute();
    $resultExamples = $stmtExamples->get_result();

    while ($exrowsub = $resultExamples->fetch_assoc()) {
        // $dst = str_replace("<", '<span class="blue">', $exrowsub['dst']);
        // $src = str_replace("<", '<span class="blue">', $exrowsub['src']);
        // $dst = str_replace(">", '</span>', $dst);
        // $src = str_replace(">", '</span>', $src);

        $wordsAndSentencesExamplesArr = extractSentenceParts($exrowsub['dst']);
        $frasesAndSentencesExamplesArr = extractSentenceParts($exrowsub['src']);

        $examplesData[] = [
            'dst' => $wordsAndSentencesExamplesArr,
            'src' => $frasesAndSentencesExamplesArr,
        ];
    }

    $enexEntries[] = [
        'textout' => $exrow['textout'],
        'textin' => $exrow['textin'],
        'examples' => $examplesData,
    ];
}

// print_r(count($enexEntries[0]['examples']));

$stmt = $db->prepare("SELECT * FROM syn as t1 RIGHT JOIN text as t2 ON t1.hashout = t2.hashru WHERE t1.hashin = ? and t2.orders = '1' LIMIT 3");
$searchword_md5 = md5($searchword_ru);
$stmt->bind_param("s", $searchword_md5);
$isQuerySuccssfull = $stmt->execute();
$n = 0;
$query_result = $stmt->get_result();

$dictionaryEntries = [];

while ($simrow = $query_result->fetch_assoc()) {
    $dictionaryEntries[] = [
        'entext' => $simrow['entext'],
        'url' => $simrow['url'],
        'text' => $simrow['text'],
    ];
}

$stmt = $db->prepare("SELECT * FROM deriv as t1 RIGHT JOIN text as t2 ON t1.hashout = t2.hashru WHERE t1.hashin = ? and t2.orders = '1'");
$searchword_md5 = md5($searchword_ru);
$stmt->bind_param("s", $searchword_md5);
$isQuerySuccssfull = $stmt->execute();
$n = 0;
$query_result = $stmt->get_result();

$derivEntries = [];

while ($simrow = $query_result->fetch_assoc()) {
    $derivEntries[] = [
        'entext' => $simrow['entext'],
        'url' => $simrow['url'],
        'text' => $simrow['text'],
    ];
}

echo $twig->render('item_en.twig', [
    'search_value' => $search_value,
    'text_entries' => $text_entries,
    'searchword_ru' => $searchword_ru,
    'searchentext' => $searchentext,
    'rutooltip' => $rutooltip,
    'enexEntries' => $enexEntries, // похожие словосочетания
    'dictionaryEntries' => $dictionaryEntries,
    'derivEntries' => $derivEntries,
]);
