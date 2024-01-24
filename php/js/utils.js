document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('searchForm');
    const soundIconElements = document.querySelectorAll("#elca")

    form.addEventListener('submit', redirectToWordPage);
    soundIconElements.forEach(e => {
        e.addEventListener('click', playAudio)
    })
});

function playAudio(e) {
    const soundName = e.target.getAttribute('data-sound')
    const audio = new Audio(`/audio/${soundName}.mp3`);
    audio.play();
}

function getLang(text) {
    const cyrillicPattern = /[А-Яа-яЁё]/;
    const latinPattern = /[A-Za-z]/;

    if (cyrillicPattern.test(text)) {
        return "ru"
    } else if (latinPattern.test(text)) {
        return "en"
    } else {
        // Если язык не определен, можно использовать значение по умолчанию
        // или какую-то логику обработки неизвестного языка
        return "-na-anglijskom-perevod-primery";
    }
}


function getSuffixBasedOnLanguage(text) {
    const cyrillicPattern = /[А-Яа-яЁё]/;
    const latinPattern = /[A-Za-z]/;

    if (cyrillicPattern.test(text)) {
        return "-na-anglijskom-perevod-primery";
    } else if (latinPattern.test(text)) {
        return "-na-russkom-perevod-primery";
    } else {
        // Если язык не определен, можно использовать значение по умолчанию
        // или какую-то логику обработки неизвестного языка
        return "-na-anglijskom-perevod-primery";
    }
}

function transliterateString(str, length = 32) {
    const from = [
        "А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь", "Э", "Ю", "Я",
        "а", "б", "в", "г", "д", "е", "ё", "ж", "з", "и", "й", "к", "л", "м", "н", "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ы", "ь", "э", "ю", "я",
        "!", "?", ". ", ",", ":", ";"
    ];
    const to = [
        "A", "B", "V", "G", "D", "E", "YO", "ZH", "Z", "I", "J", "K", "L", "M", "N", "O", "P", "R", "S", "T", "U", "F", "KH", "TS", "CH", "SH", "SHCH", "", "Y", "", "E", "YU", "YA",
        "a", "b", "v", "g", "d", "e", "yo", "zh", "z", "i", "j", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u", "f", "kh", "ts", "ch", "sh", "shch", "", "y", "", "e", "yu", "ya",
        "", "", ".", "", "", ""
    ];

    let out = str.split("").map(function (char) {
        const index = from.indexOf(char);
        return index !== -1 ? to[index] : char;
    }).join("");

    out = out.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    if (out.endsWith("-")) out = out.slice(0, -1);
    return out.substring(0, length);
}

function redirectToWordPage() {
    const inputField = document.getElementById("searchInput");
    let form = document.getElementById("searchForm");
    const baseUrl = "/";

    const postfix = getSuffixBasedOnLanguage(inputField.value);
    const translatedUrl = transliterateString(inputField.value);

    form.action = baseUrl + encodeURIComponent(translatedUrl) + postfix;
}