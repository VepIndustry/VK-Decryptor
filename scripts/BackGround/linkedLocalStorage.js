var BGLocalStorage = {
    title: "BGLocalStorage",
    "private": !1,

    getKey: function (id) {
        return localStorage.getItem(id);
    },

    setKey: function (id, key) {
        localStorage.setItem(id, key);
    }
};

//Слушаем расширение, так как оно может обновить существующий пароль или запросить новый
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (!(sender.tab)) {
            if (request['type'] === 'get') {
                let key = BGLocalStorage.getKey(request['id']);
                sendResponse(key);
            } else if (request['type'] === 'set') {
                BGLocalStorage.setKey(request['id'], request['key']);
                Back_Utils.update();
                if (Back_Utils.getVersion(Back_Utils.getUrl()) === "full") {
                    Full_Utils.updateInput(true);
                }
            } else if (request['type'] === 'name') {
                let name = document.getElementsByClassName("im-page--title-main-inner _im_page_peer_name");
                if (name.length === 0) {
                    sendResponse("no_name");
                } else {
                    sendResponse(name[0].innerText);
                }
            }
        }
    }
);
