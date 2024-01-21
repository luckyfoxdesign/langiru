<?
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
?>

<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Страницы не существует</title>
    <link rel="icon" sizes="32x32" href="/images/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0">
    <link rel="stylesheet" href="/css/diki-bundle.css" type="text/css">
    <script src="/js/diki-bundle.js"></script>
    <script src="/js/utils.js"></script>
    <script src="/js/clearsearch.js"></script>
</head>
<body class="isDesktop clearSearchForIosEnabled dikibody item" data-disable-error-logging="1">
<div class="dikibody">
    <div id="thinHeaderMenuFixedPlacement">
        <div id="thinHeaderMenuRelativeToFixedPlacementBox">
            <div id="thinHeaderMenu">
                <div class="menuItem menuProfileItem">
                    <a href="/">
                        <img class="userAvatarImage notLogged" src="/images/diki_logo.svg" width="55">
                    </a>
                </div>
                <div class="menuItem"><a href="/">Главная</a></div>
                <div class="menuItem"><a href="/">Список слов и фраз</a></div>
                <div class="menuDivider"></div>
            </div>
        </div>
    </div>
    <div class="dikitop">

        <div class="dikiHeaderAndInputSearchContainer">
            <div class="dikiHeaderMenuIcon">
                <div id="thinHeaderMenuIcon">
                    <div></div>
                </div>
            </div>
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
                                                                     value="<?= $paramValue ?>"
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
            <div class="diki-results-container" style="padding: 16px;">
                <div style="padding: 0px 8px;">
                    <p>К сожалению, по вашему запросу у нас пока ничего нет.</br>Проверьте нет ли опечатки. Если такое
                        слово существует, то мы постараемся это исправить.</p>
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