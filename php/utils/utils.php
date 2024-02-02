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
