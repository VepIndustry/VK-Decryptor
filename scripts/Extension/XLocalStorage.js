var XLocalStorage = {
    title: "XLocalStorage",
    "private": !1,

    getKey: function (id, callback) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {'type': 'get', 'id': id}, function (response) {
                callback(response);
            });
        });
    },

    setKey: function (id, key) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {'type': 'set', 'id': id, 'key': key});
        });
    }
};
