//Контейнер с сообщениями
let messages;


let version = Back_Utils.getVersion(Back_Utils.getUrl());
if (version === "mobile") {
    Mobile_Utils.start();
} else if (version === "full") {
    Full_Utils.start();
}