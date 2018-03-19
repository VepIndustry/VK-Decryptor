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
            }
        }
    }
);
