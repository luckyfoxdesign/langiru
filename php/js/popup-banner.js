var PopupBanner = function() {
function PopupBanner() {}
PopupBanner.closePopupBanner = function(nameId) {
var date = new Date();
date.setTime(date.getTime() + 24 * 60 * 60 * 1e3);
Cookies.set("popupBannerClosed_" + nameId, "true", {
expires: date
});
$("#" + nameId).detach();
};
return PopupBanner;
}();

$(function() {
$(".popupBannerContainer").css("opacity", 1);
});
