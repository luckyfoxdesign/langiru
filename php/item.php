<?php
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

//new
$stmt = $db->prepare("SELECT rutext, hashru, hashen, rutooltip, entext FROM text WHERE url = ? AND orders = 1 LIMIT 1");

//old
//$stmt = $db->prepare("SELECT * FROM text WHERE url = ? AND orders = 1 LIMIT 1");
$stmt->bind_param("s", $urlwords);
$isQuerySuccssfull = $stmt->execute();

if ($isQuerySuccssfull) {
    $query_result = $stmt->get_result();
    $results_arr = $query_result->fetch_assoc();

    if (!$results_arr || !isset($results_arr['rutext'])) {
        $str = "Location: /$urlwords-not-found?t=1";
        header($str);
        exit;
    }
    $search_value = $results_arr['rutext'];
    $searchwordhashru = $results_arr['hashru'];
    $searchenhash = $results_arr['hashen'];
    $rutooltip = $results_arr['rutooltip'];
    $searchentext = $results_arr['entext'];
} else {
    // Handle error
    echo "Error executing query: " . $db->error;
}

$stmtText = $db->prepare("SELECT t1.entext, t1.hashru AS hashrut, t1.hashen, t1.rutooltip FROM text AS t1 INNER JOIN (SELECT MIN(id) as id, entext FROM text GROUP BY entext) AS subquery ON t1.id = subquery.id WHERE t1.hashru = ? ORDER BY subquery.id ASC LIMIT 3");
$stmtText->bind_param("s", $searchwordhashru);
$stmtText->execute();
$resultText = $stmtText->get_result();

$text_entries = [];
// что это такое тут запрашивается?
while ($exrow = $resultText->fetch_assoc()) {
    $stmtExamples = $db->prepare("SELECT * FROM examples WHERE hashen = ? AND hashru = ? ORDER BY id LIMIT 3");
    $stmtExamples->bind_param("ss", $exrow['hashen'], $exrow['hashrut']);
    $stmtExamples->execute();
    $resultExamples = $stmtExamples->get_result();

    $examples = [];
    while ($exrowsub = $resultExamples->fetch_assoc()) {
        $wordsAndSentencesExamplesArr = extractSentenceParts($exrowsub['dst']);
        $frasesAndSentencesExamplesArr = extractSentenceParts($exrowsub['src']);

        $exrowsub['dst'] = $wordsAndSentencesExamplesArr;
        $exrowsub['src'] = $frasesAndSentencesExamplesArr;

        $examples[] = $exrowsub;
    }

    $exrow['examples'] = $examples;

    $exrow['exists'] = true;

    $stmt = $db->prepare("SELECT * FROM text WHERE entext = ? AND orders = 1 LIMIT 1");
    $stmt->bind_param("s", $exrow['entext']);
    $isQuerySuccssfull = $stmt->execute();

    if ($isQuerySuccssfull) {
        $query_result = $stmt->get_result();
        $results_arr = $query_result->fetch_assoc();

        if (!$results_arr || !isset($results_arr['entext'])) {
            $exrow['exists'] = false;
        }
    } else {
        // Handle error
        echo "Error executing query: " . $db->error;
    }

    $text_entries[] = $exrow;

    // print_r($examples);
}

$stmtEnex = $db->prepare("SELECT * FROM enex WHERE hashin LIKE ? LIMIT 3");
$paramEnex = "%" . $searchenhash . "%";
$stmtEnex->bind_param("s", $paramEnex);
$stmtEnex->execute();
$resultEnex = $stmtEnex->get_result();

$enexEntries = [];
while ($exrow = $resultEnex->fetch_assoc()) {
    $stmtExamples = $db->prepare("SELECT * FROM examples WHERE hashen = ? AND hashru = ? ORDER BY id LIMIT 3");
    $stmtExamples->bind_param("ss", $exrow['hashin'], $exrow['hashout']);
    $stmtExamples->execute();
    $resultExamples = $stmtExamples->get_result();

    $examples = [];
    // что это такое тут запрашивается?
    while ($exrowsub = $resultExamples->fetch_assoc()) {

        $wordsAndSentencesExamplesArr = extractSentenceParts($exrowsub['dst']);
        $frasesAndSentencesExamplesArr = extractSentenceParts($exrowsub['src']);

        $exrowsub['dst'] = $wordsAndSentencesExamplesArr;
        $exrowsub['src'] = $frasesAndSentencesExamplesArr;

        $examples[] = $exrowsub;
    }

    // print_r($examples);

    $exrow['examples'] = $examples;
    $enexEntries[] = $exrow;
}

$stmt = $db->prepare("SELECT * FROM syn as t1 RIGHT JOIN text as t2 ON t1.hashout = t2.hashru WHERE t1.hashin = ? and t2.orders = '1' LIMIT 8");
$searchword_md5 = md5($search_value);
$stmt->bind_param("s", $searchword_md5);
$stmt->execute();
$query_result = $stmt->get_result();

$dictionaryEntries = [];
while ($simrow = $query_result->fetch_assoc()) {
    if (isset($simrow['dst'])) {
        $simrow['dst'] = str_replace("<", '<span class="blue">', $simrow['dst']);
    } else {
        $simrow['dst'] = "";
    }
    $dictionaryEntries[] = $simrow;
}

$stmt = $db->prepare("SELECT * FROM deriv as t1 RIGHT JOIN text as t2 ON t1.hashout = t2.hashru WHERE t1.hashin = ? and t2.orders = '1' LIMIT 8");
$searchword_md5 = md5($search_value);
$stmt->bind_param("s", $searchword_md5);
$stmt->execute();
$query_result = $stmt->get_result();

$derivEntries = [];
while ($simrow = $query_result->fetch_assoc()) {
    if (isset($simrow['dst'])) {
        $simrow['dst_processed'] = str_replace("<", '<span class="blue">', $simrow['dst']);
    } else {
        $simrow['dst_processed'] = "";
    }
    $derivEntries[] = $simrow;
}

echo $twig->render('item.twig', [
    'text_entries' => $text_entries,
    'search_value' => $search_value,
    'searchentext' => $searchentext,
    'rutooltip' => $rutooltip,
    'enexEntries' => $enexEntries,
    'dictionaryEntries' => $dictionaryEntries,
    'derivEntries' => $derivEntries,
]);
