<?
include "connect.php";
$urlwords = htmlspecialchars($_GET["url"]);
function translateToUrl($str = '', $length = 32)
{
    $from = array('А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'
    , 'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'
    , '!', '?', '.', ',', ':', ';'
    );
    $to = array('A', 'B', 'V', 'G', 'D', 'E', 'YO', 'ZH', 'Z', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'F', 'KH', 'TS', 'CH', 'SH', 'SHCH', '', 'Y', '', 'E', 'YU', 'YA'
    , 'a', 'b', 'v', 'g', 'd', 'e', 'yo', 'zh', 'z', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'kh', 'ts', 'ch', 'sh', 'shch', '', 'y', '', 'e', 'yu', 'ya'
    , '', '', '.', '', '', ''
    );
    $out = strtolower(str_replace($from, $to, trim($str)));
    $out = preg_replace("/([^a-z0-9-]{1})/", '-', $out);
    $out = preg_replace("/([-]+)/", '-', $out);
    if (substr($out, -1) == '-') $out = substr($out, 0, -1);
    $out = substr($out, 0, $length);
    return $out;

}

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
    $searchword = $results_arr['entext'];
    $searchword_ru = $results_arr['rutext'];
    $searchenhash = $results_arr['hashen'];
    $rutooltip = $results_arr['rutooltip'];
    $searchentext = $results_arr['entext'];
} else {
    // Handle error
    echo "Error executing query: " . $db->error;
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title><?= $searchword ?> — перевод на Русский с примерами в тексте, произношение</title>
    <meta name="description"
          content="Перевод слова <?= $searchword ?> на русский язык. Примеры предложений и правильное произношение.">
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
                                                                     name="q"
                                                                     value="<?= $searchword ?>"
                                                                     autofocus="autofocus"
                                                                     autocomplete="off"
                                                                     autocorrect="off"
                                                                     autocapitalize="none"
                                                                     spellcheck="false"
                                                                     x-webkit-speech="x-webkit-speech"
                                                                     lang="en"
                                                                     id="searchInput"
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
                    <?= $searchword ?> перевод на русский
                </h1>
            </div>
            <div class="diki-results-container">
                <div class="diki-results-left-column">
                    <div>

                        <div class="dictionaryEntity">
                            <div class="hws">
                                <h2><span class="hw"><?= $searchentext ?></span><span
                                        class="recordingsAndTranscriptions"><span class="en-US hasRecording"
                                                                                  title="Озвучить"><span
                                                class="audioIcon icon-sound dontprint soundOnClick" tabindex="-1"
                                                id="elca"
                                                data-sound="<?= $searchentext ?>"></span></span></span>
                                    <span class="dictionaryMeaningGroupHeaderAdditionalInformation">
          </span>
                                </h2></div>
                            <div class="partOfSpeechSectionHeader">
                                <span class="partOfSpeech"><?= $rutooltip ?></span></div>
                            <h2>Примеры</h2>
                            <ol class="nativeToForeignEntrySlices">


                                <?
                                $stmtText = $db->prepare("
    SELECT t1.hashru AS hashrut, t1.entext, t1.rutext, t1.hashen, t1.rutooltip, MIN(t1.id) AS min_id
    FROM text AS t1
    LEFT JOIN enmean AS t2 ON t1.hashen = t2.hashin
    WHERE t1.hashen = ? 
    GROUP BY t1.rutext, t1.hashru, t1.entext, t1.hashen, t1.rutooltip
    ORDER BY MIN(t1.id) ASC 
    LIMIT 40
");


                                $searchwordhash = md5($searchword);
                                $stmtText->bind_param("s", $searchwordhash);
                                $stmtText->execute();
                                $resultText = $stmtText->get_result();

                                while ($exrow = $resultText->fetch_assoc()) {
                                    $hashen = $exrow['hashen'];
                                    $hashru = $exrow['hashrut'];
                                    $entext_example = $exrow['entext'];
                                    ?>


                                    <li>
          <span class="hw">
      <span class="plainLink"><?= $exrow['rutext'] ?></span>    </span>
                                        <ul class="nativeToForeignMeanings">
                                            <li class="meaning52324">
                                                <span class="hw"><?= $exrow['rutooltip'] ?></span>
                                                <span class="meaningAdditionalInformation">
          </span>
                                                <?
                                                $stmtExamples = $db->prepare("SELECT * FROM examples WHERE hashen = ? AND hashru = ? ORDER BY id");
                                                $stmtExamples->bind_param("ss", $hashen, $hashru);
                                                $stmtExamples->execute();
                                                $resultExamples = $stmtExamples->get_result();
                                                //                                                $exaplesub = mysql_query("SELECT *
                                                //			FROM examples
                                                //			WHERE hashen = '" . $hashen . "' AND hashru = '" . $hashru . "' ORDER BY id
                                                //			");
                                                while ($exrowsub = $resultExamples->fetch_assoc()) {
                                                    $dst = str_replace("<", '<span class="blue">', $exrowsub['dst']);
                                                    $src = str_replace("<", '<span class="blue">', $exrowsub['src']);
                                                    $dst = str_replace(">", '</span>', $dst);
                                                    $src = str_replace(">", '</span>', $src);

                                                    $pos = strpos($dst, $entext_example);


                                                    if ($pos === false) {

                                                    } else {


                                                        ?>

                                                        <div class="exampleSentence">
                                                            <?= $dst ?><br><span class="exampleSentenceTranslation">
 <?= $src ?>
 </span></div>

                                                    <? }
                                                } ?>


                                            </li>
                                        </ul>
                                    </li>


                                <? } ?>


                            </ol>


                            <h2>Похожие словосочетания</h2>
                            <ol class="nativeToForeignEntrySlices">


                                <?
                                $stmtEnex = $db->prepare("SELECT * FROM enex WHERE hashin LIKE ? LIMIT 40");
                                $paramEnex = "%" . $searchenhash . "%";
                                $stmtEnex->bind_param("s", $paramEnex);
                                $stmtEnex->execute();
                                $resultEnex = $stmtEnex->get_result();

                                //                                $exaple = mysql_query("SELECT *
                                //			FROM enex 
                                //			WHERE hashin LIKE '%" . $searchenhash . "'  LIMIT 40
                                //			");
                                while ($exrow = $resultEnex->fetch_assoc()) {
                                    $hashenq = $exrow['hashin'];
                                    $hashruq = $exrow['hashout'];
                                    ?>


                                    <li>
          <span class="hw">
      <span class="plainLink"><?= $exrow['textout'] ?></span>    </span>

                                        <ul class="nativeToForeignMeanings">
                                            <li class="meaning52324">
                                                <span class="hw"><?= $exrow['textin'] ?></span>
                                                <span class="meaningAdditionalInformation">
          </span>
                                                <?
                                                $stmtExamples = $db->prepare("SELECT * FROM examples WHERE hashen = ? AND hashru = ? ORDER BY id");
                                                $stmtExamples->bind_param("ss", $hashenq, $hashruq);
                                                $stmtExamples->execute();
                                                $resultExamples = $stmtExamples->get_result();

                                                //                                                $exaplesub = mysql_query("SELECT *
                                                //			FROM examples
                                                //			WHERE hashen = '" . $hashenq . "' AND hashru = '" . $hashruq . "' ORDER BY id
                                                //			");
                                                while ($exrowsub = $resultExamples->fetch_assoc()) {
                                                    $dst = str_replace("<", '<span class="blue">', $exrowsub['dst']);
                                                    $src = str_replace("<", '<span class="blue">', $exrowsub['src']);
                                                    $dst = str_replace(">", '</span>', $dst);
                                                    $src = str_replace(">", '</span>', $src);
                                                    ?>

                                                    <div class="exampleSentence"><?= $dst ?><br><span
                                                            class="exampleSentenceTranslation">
 <?= $src ?>
 </span></div>

                                                <? } ?>


                                            </li>
                                        </ul>
                                    </li>


                                <? } ?>


                            </ol>


                        </div>
                        <br></div>
                </div>

                <div class="diki-results-right-column">
                    <div>
                        <h2 class="dictionarySectionHeader" style="">Синонимы</h2>
                        <div class="dictionaryCollapsedSection">

                            <?
                            $stmt = $db->prepare("SELECT * FROM syn as t1 RIGHT JOIN text as t2 ON t1.hashout = t2.hashru WHERE t1.hashin = ? and t2.orders = '1'");
                            $searchword_md5 = md5($searchword_ru);
                            $stmt->bind_param("s", $searchword_md5);
                            $isQuerySuccssfull = $stmt->execute();

                            //                            $similar = mysql_query("SELECT *
                            //			FROM syn as t1
                            //			RIGHT JOIN text AS t2 ON t1.hashout = t2.hashru
                            //			WHERE t1.hashin = '" . md5($searchword_ru) . "' AND t2.orders = '1'
                            //			");
                            $n = 0;
                            $query_result = $stmt->get_result();
                            while ($simrow = $query_result->fetch_assoc()) {
//                                $dst = str_replace("<", '<span class="blue">', $simrow['dst']);
                                $n++;
                                ?>
                                <div class="dictionaryEntity">
                                    <div class="fentry">
      <span class="fentrymain"><span class="hw"><a
                  href="/<?= $simrow['entext'] ?>-na-russkom-perevod-primery"><?= $simrow['entext'] ?></a></span>    <span
              class="dictionaryMeaningGroupHeaderAdditionalInformation">
          </span>
    </span> = <span class="hw">
      <a href="/<?= $simrow['url'] ?>-na-anglijskom-perevod-primery"
         class="plainLink"><?= $simrow['text'] ?></a>    </span>
                                        <span class="otherm"></span>
                                    </div>
                                </div>

                            <? } ?>
                        </div>


                        <h2 class="dictionarySectionHeader seealso" style="margin-top: 40px;">Родственные слова</h2>
                        <div class="dictionaryCollapsedSection">

                            <?
                            $stmt = $db->prepare("SELECT * FROM deriv as t1 RIGHT JOIN text as t2 ON t1.hashout = t2.hashru WHERE t1.hashin = ? and t2.orders = '1'");
                            $searchword_md5 = md5($searchword_ru);
                            $stmt->bind_param("s", $searchword_md5);
                            $isQuerySuccssfull = $stmt->execute();

                            //                            $similar = mysql_query("SELECT *
                            //			FROM deriv as t1
                            //			RIGHT JOIN text AS t2 ON t1.hashout = t2.hashru
                            //			WHERE t1.hashin = '" . md5($searchword_ru) . "' AND t2.orders = '1'
                            //			");
                            $n = 0;
                            $query_result = $stmt->get_result();
                            while ($simrow = $query_result->fetch_assoc()) {
//                                $dst = str_replace("<", '<span class="blue">', $simrow['dst']);
                                $n++;
                                ?>
                                <div class="dictionaryEntity">
                                    <div class="fentry">
      <span class="fentrymain"><span class="hw"><a
                  href="/<?= $simrow['entext'] ?>-na-russkom-perevod-primery"><?= $simrow['entext'] ?></a></span>    <span
              class="dictionaryMeaningGroupHeaderAdditionalInformation">
          </span>
    </span> = <span class="hw">
      <a href="/<?= $simrow['url'] ?>-na-anglijskom-perevod-primery"
         class="plainLink"><?= $simrow['text'] ?></a>    </span>
                                        <span class="otherm"></span>
                                    </div>
                                </div>

                            <? } ?>
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