<?php
include "connect.php";
?>

<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Русско-английский онлайн-переводчик и словарь</title>
    <meta name="description"
          content="Русско-английский словарь и онлайн-переводчик английского языка. Словарь содержит записи произношения, примеры предложений и фотографии.">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0">
    <script src="/js/diki-bundle.js"></script>
    <link rel="stylesheet" href="/css/diki-bundle.css" type="text/css">
    <link rel="stylesheet" href="/css/popup-banners.css" type="text/css">
    <script src="/js/utils.js"></script>
    <script src="/js/clearsearch.js"></script>
    <script src="/js/popup-banner.js"></script>
</head>
<body class="isDesktop clearSearchForIosEnabled isMainpage dikibody" data-disable-error-logging="1">
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

    <div id="contentWrapper">
        <div class="dikiBackgroundBannerPlaceholder">
            <script>
                DikiDictionary.searchUrlPrefix = "/slownik-angielskiego";
                DikiDictionary.langpair = "en::pl";
            </script>
            <div class="dikiHeaderMenuIcon">
                <div id="thinHeaderMenuIcon">
                    <div></div>
                </div>
            </div>
            <div class="dikiLogoAndSearchFormWrapperMobile">
                <div class="logo">
                    <img src="/images/diki_logo.svg" width="103" height="83"
                         alt="Langi - англо-русский словарь онлайн" />
                </div>
                <h1 class="mainPageSloganUnderLogo">Мультимедийный русско-английский словарь</h1>
                <div class="dikiHeaderAndInputSearchContainer">
                    <div class="dikiHeaderInputSearchCentered">
                        <form class="dikiSearchForm dikiSearchFormMainPage" id="searchForm" action="/" method="get">
                            <input type="search" id="searchInput"
                                   class="dikiSearchInputField doNotPopupDikiOnDoubleClick"
                                   value="" autofocus="autofocus" autocomplete="off" autocorrect="off"
                                   autocapitalize="none" spellcheck="false" x-webkit-speech="x-webkit-speech" lang="en"
                                   accesskey="w" placeholder="Введите слово или фразу" />
                            <button type="submit" class="dikiSearchMainPageSubmit"></button>
                            <div class="autocompleteResults"></div>
                        </form>
                    </div>
                    <div class="recentsearches">
                        <div class="recentSearchContainer" style=""
                             data-recent-search-url-template="<a href=&quot;/slownik-angielskiego?q=XqueryX&quot;>XqueryX</a>">
                            <a href="/"> Последние поиски: </a>
                            <?php
                            function translateToUrl($str = '', $length = 32)
                            {
                                $from = array(
                                    'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я',
                                    'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я',
                                    '!', '?', '. ', ',', ':', ';'
                                );
                                $to = array(
                                    'A', 'B', 'V', 'G', 'D', 'E', 'YO', 'ZH', 'Z', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'F', 'KH', 'TS', 'CH', 'SH', 'SHCH', '', 'Y', '', 'E', 'YU', 'YA',
                                    'a', 'b', 'v', 'g', 'd', 'e', 'yo', 'zh', 'z', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'kh', 'ts', 'ch', 'sh', 'shch', '', 'y', '', 'e', 'yu', 'ya',
                                    '', '', '. ', '', '', ''
                                );
                                $out = strtolower(str_replace($from, $to, trim($str)));
                                $out = preg_replace("/([^a-z0-9-]{1})/", '-', $out);
                                $out = preg_replace("/([-]+)/", '-', $out);
                                if (substr($out, -1) == '-') $out = substr($out, 0, -1);
                                $out = substr($out, 0, $length);
                                return $out;
                            }

                            $query = "SELECT * FROM text WHERE orders = '1' ORDER BY id ASC LIMIT 50";
                            $query_result = $db->query($query);

                            while ($popular_words_arr = $query_result->fetch_assoc()) {
                                ?>
                                <a href="/<?= $popular_words_arr['url'] ?>-na-anglijskom-perevod-primery"><?= $popular_words_arr['rutext'] ?></a>
                                <?php
                            }
                            ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
</body>
</html>