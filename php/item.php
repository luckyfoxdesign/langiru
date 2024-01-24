<?
include "connect.php";

$urlwords = htmlspecialchars($_GET["url"]);
function translateToUrl($str = '', $length = 32)
{
    $from = array('А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'
        , 'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'
        , '!', '?', '.', ',', ':', ';',
    );
    $to = array('A', 'B', 'V', 'G', 'D', 'E', 'YO', 'ZH', 'Z', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'F', 'KH', 'TS', 'CH', 'SH', 'SHCH', '', 'Y', '', 'E', 'YU', 'YA'
        , 'a', 'b', 'v', 'g', 'd', 'e', 'yo', 'zh', 'z', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'kh', 'ts', 'ch', 'sh', 'shch', '', 'y', '', 'e', 'yu', 'ya'
        , '', '', '.', '', '', '',
    );
    $out = strtolower(str_replace($from, $to, trim($str)));
    $out = preg_replace("/([^a-z0-9-]{1})/", '-', $out);
    $out = preg_replace("/([-]+)/", '-', $out);
    if (substr($out, -1) == '-') {
        $out = substr($out, 0, -1);
    }

    $out = substr($out, 0, $length);
    return $out;

}

$stmt = $db->prepare("SELECT * FROM text WHERE url = ? AND orders = 1 LIMIT 1");
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
    $searchword = $results_arr['rutext'];
    $searchwordhashru = $results_arr['hashru'];
    $searchenhash = $results_arr['hashen'];
    $rutooltip = $results_arr['rutooltip'];
    $searchentext = $results_arr['entext'];
} else {
    // Handle error
    echo "Error executing query: " . $db->error;
}

function isValueExists($value, $newValue)
{
    return isset($value) ? $value : $newValue;
}

?>

<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title><?=$searchword?> — перевод на Английский с примерами в тексте, произношение</title>
    <meta name="description"
          content="Как сказать <?=$searchword?> на английском. Как произнести <?=$searchword?> и как написать по-английски? Примеры предложений и правильное произношение слушать онлайн.">
    <link rel="icon" sizes="32x32" href="/images/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0">
    <link rel="stylesheet" href="/css/diki-bundle.css" type="text/css">
    <script src="/js/clearsearch.js"></script>
    <script src="/js/utils.js"></script>
    <script data-ad-client="ca-pub-3236417930126014" async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
</head>
<body class="isDesktop clearSearchForIosEnabled dikibody item" data-disable-error-logging="1">
<div class="dikibody">
    <div class="dikitop">

        <div class="dikiHeaderAndInputSearchContainer">
            <div class="dikiHeaderAdContainer"><br></div>
            <div class="dikiHeaderLogo">
                <a href="/">
                    <img src="/images/diki_logo.svg" width="110" height="58"
                         alt="Англо русский онлайн словарь с примерами" class="absmiddle doNotScaleImage"> </a>
            </div>
            <div class="dikiHeaderInputSearch">
                <form class="dikiSearchForm dikiSearchHeaderTop"
                      action="/" method="get" id="searchForm"><input type="search"
                                                                     class="dikiSearchInputField doNotPopupDikiOnDoubleClick"
                                                                     value="<?=$searchword?>"
                                                                     autofocus="autofocus"
                                                                     autocomplete="off"
                                                                     autocorrect="off"
                                                                     autocapitalize="none"
                                                                     spellcheck="false"
                                                                     x-webkit-speech="x-webkit-speech"
                                                                     id="searchInput"
                                                                     lang="en"
                                                                     accesskey="w"
                                                                     placeholder="Введите слово или фразу" />
                    <button type="submit" class="dikiSearchMainPageSubmit"></button>
                    <div class="autocompleteResults"></div>
                </form>
            </div>
        </div>

    </div>
    <div id="contentWrapper">
        <div class="dikiBackgroundBannerPlaceholder">
            <div class="dikitop">
                <h1 class="dictionarySectionHeader">
                    <?=$searchword?> перевод на английский
                </h1>
            </div>
            <div class="diki-results-container">
                <div class="diki-results-left-column">
                    <div>

                        <div class="dictionaryEntity">
                            <div class="hws">
                                <h2><span class="hw"><?=$searchentext?></span><span
                                        class="recordingsAndTranscriptions"><span class="en-US hasRecording"
                                                                                  title="Озвучить"><span
                                                class="audioIcon icon-sound dontprint soundOnClick" tabindex="-1" id="elca"
                                                data-sound="<?=$searchentext?>"></span></span></span>
                                    <span class="dictionaryMeaningGroupHeaderAdditionalInformation">
          </span>
                                </h2></div>
                            <div class="partOfSpeechSectionHeader">
                                <span class="partOfSpeech"><?=$rutooltip?></span></div>
                            <h2>Примеры</h2>
                            <ol class="nativeToForeignEntrySlices">
                                <?php
$stmtText = $db->prepare("
        SELECT t1.entext, t1.hashru AS hashrut, t1.hashen, t1.rutooltip
        FROM text AS t1
        INNER JOIN (
            SELECT MIN(id) as id, entext
            FROM text
            GROUP BY entext
        ) AS subquery ON t1.id = subquery.id
        WHERE t1.hashru = ?
        ORDER BY subquery.id ASC
        LIMIT 40
    ");
$stmtText->bind_param("s", $searchwordhashru);
$stmtText->execute();
$resultText = $stmtText->get_result();

while ($exrow = $resultText->fetch_assoc()) {
    $hashen = $exrow['hashen'];
    $hashru = $exrow['hashrut'];
    ?>
                                    <li>
            <span class="hw">
                <span class="plainLink"><?=htmlspecialchars($exrow['entext'])?></span>
            </span>
                                        <span class="recordingsAndTranscriptions">
                <span class="en-GB hasRecording" title="Озвучить текст">
                    <span class="audioIcon icon-sound dontprint soundOnClick" tabindex="-1" id="elca"
                          data-sound="<?=htmlspecialchars(str_replace(" ", "-", $exrow['entext']))?>"></span>
                </span>
            </span>
                                        <ul class="nativeToForeignMeanings">
                                            <li class="meaning52324">
                                                <span class="hw"><?=htmlspecialchars($exrow['rutooltip'])?></span>
                                                <span class="meaningAdditionalInformation"></span>
                                                <?php
$stmtExamples = $db->prepare("SELECT * FROM examples WHERE hashen = ? AND hashru = ? ORDER BY id");
    $stmtExamples->bind_param("ss", $hashen, $hashru);
    $stmtExamples->execute();
    $resultExamples = $stmtExamples->get_result();

    while ($exrowsub = $resultExamples->fetch_assoc()) {
        $dst = str_replace("<", '<span class="blue">', htmlspecialchars($exrowsub['dst']));
        $src = str_replace("<", '<span class="blue">', htmlspecialchars($exrowsub['src']));
        $dst = str_replace(">", '</span>', $dst);
        $src = str_replace(">", '</span>', $src);
        ?>
                                                    <div class="exampleSentence">
                                                        <?=$dst?><br>
                                                        <span class="exampleSentenceTranslation"><?=$src?></span>
                                                    </div>
                                                <?php }?>
                                            </li>
                                        </ul>
                                    </li>
                                <?php }?>
                            </ol>

                            <h2>Похожие словосочетания</h2>
                            <ol class="nativeToForeignEntrySlices">
                                <?php
$stmtEnex = $db->prepare("SELECT * FROM enex WHERE hashin LIKE ? LIMIT 40");
$paramEnex = "%" . $searchenhash . "%";
$stmtEnex->bind_param("s", $paramEnex);
$stmtEnex->execute();
$resultEnex = $stmtEnex->get_result();

while ($exrow = $resultEnex->fetch_assoc()) {
    $hashenq = $exrow['hashin'];
    $hashruq = $exrow['hashout'];
    ?>
                                    <li>
            <span class="hw">
                <span class="plainLink"><?=htmlspecialchars($exrow['textout'])?></span>
            </span>
                                        <span class="recordingsAndTranscriptions">
                <span class="en-GB hasRecording" title="Озвучить текст">
                    <span class="audioIcon icon-sound dontprint soundOnClick" tabindex="-1"
                          data-sound="<?=htmlspecialchars(str_replace(" ", "_", $exrow['textout']))?>"></span>
                </span>
            </span>
                                        <ul class="nativeToForeignMeanings">
                                            <li class="meaning52324">
                                                <span class="hw"><?=htmlspecialchars($exrow['textin'])?></span>
                                                <span class="meaningAdditionalInformation"></span>
                                                <?php
$stmtExamples = $db->prepare("SELECT * FROM examples WHERE hashen = ? AND hashru = ? ORDER BY id");
    $stmtExamples->bind_param("ss", $hashenq, $hashruq);
    $stmtExamples->execute();
    $resultExamples = $stmtExamples->get_result();

    while ($exrowsub = $resultExamples->fetch_assoc()) {
        $dst = htmlspecialchars(str_replace("<", '<span class="blue">', $exrowsub['dst']));
        $src = htmlspecialchars(str_replace("<", '<span class="blue">', $exrowsub['src']));
        $dst = str_replace(">", '</span>', $dst);
        $src = str_replace(">", '</span>', $src);
        ?>
                                                    <div class="exampleSentence"><?=$dst?><br>
                                                        <span class="exampleSentenceTranslation"><?=$src?></span>
                                                    </div>
                                                <?php } // End while for examples ?>
                                            </li>
                                        </ul>
                                    </li>
                                <?php } // End while for enex ?>
                            </ol>


                        </div>
                        <br></div>
                </div>

                <div class="diki-results-right-column">
                    <div>
                        <h2 class="dictionarySectionHeader" style="">Синонимы</h2>
                        <div class="dictionaryCollapsedSection">

                            <?php
$stmt = $db->prepare("SELECT * FROM syn as t1 RIGHT JOIN text as t2 ON t1.hashout = t2.hashru WHERE t1.hashin = ? and t2.orders = '1'");
$searchword_md5 = md5($searchword);
$stmt->bind_param("s", $searchword_md5);
$isQuerySuccssfull = $stmt->execute();

$n = 0;
$query_result = $stmt->get_result();
while ($simrow = $query_result->fetch_assoc()) {
    if (isset($simrow['dst'])) {
        $dst = str_replace("<", '<span class="blue">', $simrow['dst']);
    } else {
        $dst = ""; // Set a default value or handle the absence of 'dst' as needed
    }
    $n++;
    ?>
                                <div class="dictionaryEntity">
                                    <div class="fentry">
      <span class="fentrymain"><span class="hw"><a
                  href="/<?=$simrow['url']?>-na-anglijskom-perevod-primery"><?=$simrow['text']?></a></span>    <span
              class="dictionaryMeaningGroupHeaderAdditionalInformation">
          </span>
                                            </span> = <span class="hw">
      <a href="/<?=$simrow['entext']?>-na-russkom-perevod-primery" class="plainLink"><?=$simrow['entext']?></a>    </span>

                                        <span class="otherm"></span>
                                    </div>
                                </div>

                            <?}?>
                        </div>


                        <h2 class="dictionarySectionHeader seealso" style="margin-top: 40px;">Родственные слова</h2>
                        <div class="dictionaryCollapsedSection">

                            <?
$stmt = $db->prepare("SELECT * FROM deriv as t1 RIGHT JOIN text as t2 ON t1.hashout = t2.hashru WHERE t1.hashin = ? and t2.orders = '1'");
$searchword_md5 = md5($searchword);
$stmt->bind_param("s", $searchword_md5);
$isQuerySuccssfull = $stmt->execute();

$n = 0;
$query_result = $stmt->get_result();
while ($simrow = $query_result->fetch_assoc()) {
    if (isset($simrow['dst'])) {
        $dst = str_replace("<", '<span class="blue">', $simrow['dst']);
    } else {
        $dst = ""; // Set a default value or handle the absence of 'dst' as needed
    }
    $n++;
    ?>
                                <div class="dictionaryEntity">
                                    <div class="fentry">
      <span class="fentrymain"><span class="hw"><a
                  href="/<?=$simrow['url']?>-na-anglijskom-perevod-primery"><?=$simrow['text']?></a></span>    <span
              class="dictionaryMeaningGroupHeaderAdditionalInformation">
          </span>
    </span> = <span class="hw">
      <a href="/<?=$simrow['url']?>-na-anglijskom-perevod-primery" class="plainLink"><?=$simrow['entext']?></a>    </span>
                                        <span class="recordingsAndTranscriptions"><span class="en-GB hasRecording"
                                                                                        title="Озвучить"><span
                                                    class="audioIcon icon-sound dontprint soundOnClick" tabindex="-1" id="elca"
                                                    data-sound="<?=$simrow['entext']?>"></span></span></span>
                                        <span class="otherm"></span>
                                    </div>
                                </div>

                            <?}?>
                        </div>

                    </div>
                </div>
                <div class="clear"></div>
            </div>
            <div class="clear"></div>
        </div>
        <!-- Yandex.Metrika counter -->
        <script type="text/javascript">
            (function(m, e, t, r, i, k, a) {
                m[i] = m[i] || function() {
                    (m[i].a = m[i].a || []).push(arguments);
                };
                m[i].l = 1 * new Date();
                for (var j = 0; j < document.scripts.length; j++) {
                    if (document.scripts[j].src === r) {
                        return;
                    }
                }
                k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a);
            })
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(96022901, "init", {
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true,
                webvisor: true
            });
        </script>
        <noscript>
            <div><img src="https://mc.yandex.ru/watch/96022901" style="position:absolute; left:-9999px;" alt="" /></div>
        </noscript>
        <!-- /Yandex.Metrika counter -->
        <div class="center"></div>
    </div>
</div>
</body>
</html>