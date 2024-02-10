<?
// Слово <быть> значит быть!
// Функция делит предложение на три части
// 1 - Слово
// 2 - <быть>
// 3 - значит быть!
function extractSentenceParts($sentence)
{
    $pattern = '/(<[^>]*>)/';
    $parts = preg_split($pattern, $sentence, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
    $parts = array_map('trim', $parts);
    $parts[1] = str_replace(['<', '>'], '', $parts[1]);
    $parts = array_filter($parts, function ($part) {
        return $part !== '-';
    });

    return $parts;
}

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