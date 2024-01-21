var ClearSearchLibrary;

(function(ClearSearchLibrary) {
$.fn.clearSearch = function(options) {
if (options === void 0) {
options = {};
}
var settings = $.extend({
clearClass: "clear_input",
focusAfterClear: true,
linkText: "&times;"
}, options);
return this.each(function() {
var $this = $(this), btn, divClass = settings.clearClass + "_div";
$(this).css("paddingRight", "40px");
if (!$this.parent().hasClass(divClass)) {
$this.wrap('<div style="display: inline-block; position: relative;" class="' + divClass + '">' + $this.html() + "</div>");
$this.after('<a style="position: absolute; cursor: pointer;" class="' + settings.clearClass + '">' + '<img src="/images/diki/delete-icon.png">' + "</a>");
$this.addClass(settings.clearClass);
}
btn = $this.next();
var clearField = function() {
$this.val("").trigger("change");
triggerBtn();
if (settings.focusAfterClear) {
$this.trigger("focus");
}
if (typeof settings.callback === "function") {
settings.callback();
}
};
var triggerBtn = function() {
if (hasText()) {
btn.show();
} else {
btn.hide();
}
update();
};
var hasText = function() {
return $this.val().replace(/^\s+|\s+$/g, "").length > 0;
};
var update = function() {
var width = $this.outerWidth(), height = $this.parent().outerHeight();
var containerWidth = $this.parent().outerWidth(), ident = 0;
if ($("body").hasClass("isMobile") && $this.parent().css("text-align") == "center") {
ident = (containerWidth - width) / 2;
}
$(btn).find("img").css({
height: height * .5,
marginTop: .25 * height
});
btn.css({
height: height,
width: width - (width + ident - 3 * height / 4),
textAlign: "left",
"z-index": 500,
textDecoration: "none",
top: 0,
left: width + ident - 5 * height / 4
});
};
btn.on("click", clearField);
$this.on("keyup keydown change focus", triggerBtn);
$(window).on("orientationchange", function(event) {
setTimeout(function() {
update();
}, 500);
event.stopPropagation();
});
triggerBtn();
});
};
})(ClearSearchLibrary || (ClearSearchLibrary = {}));

$(function() {
if ($("body").hasClass("clearSearchForIosEnabled")) {
$('input[type="search"]').clearSearch();
}
});
