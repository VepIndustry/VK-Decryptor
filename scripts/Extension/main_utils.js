let standartKey = "stupidUsersMustD";

var Main_Utils = {
    title: "Main_Utils",
    "private": !1,

    getVersion: function (url) {
        if (url.includes("m.vk.com")) {
            return "mobile";
        } else if (url.includes("vk.com")) {
            return "full";
        } else {
            return "none";
        }
    },

    getId: function (callback) {
        chrome.tabs.query({
            active: true
        }, function (tabsArray) {
            let tab = tabsArray[0];
            let tabUrl = tab.url;

            if (Main_Utils.getVersion(tabUrl) === "mobile") {
                let sel_reg = /(peer=[^&]+)|(chat=[^&]+)/;
                let sel = tabUrl.match(sel_reg)[0];
                callback(sel.substring("peer=".length));
            } else if (Main_Utils.getVersion(tabUrl) === "full") {
                let sel_reg = /sel=[^&]+/;
                let sel = tabUrl.match(sel_reg)[0].substring("sel=".length);
                if (sel.startsWith("c")) {
                    callback(sel.substr(1));
                } else {
                    callback(sel);
                }
            }
        });
    },

    getPassword: function (id, callback) {
        XLocalStorage.getKey(id, function (password) {
            if (password === standartKey || (typeof password === 'undefined' || password === null || password === "")) {
                callback("");
            } else {
                callback(COFFEE.parseKey(password));
            }
        });
    },

    setKey: function (id, password) {
        if (password.length === 0) {
            XLocalStorage.setKey(id, standartKey);
        } else {
            XLocalStorage.setKey(id, COFFEE.generateKey(password));
        }
    },

    getCondition: function (id, callback) {
        XLocalStorage.getKey(id + "condition", function (condition) {
            if (typeof condition === 'undefined' || condition === null || condition === "false") {
                callback(false);
            } else {
                callback(true);
            }
        });
    },

    setCondition: function (id, condition) {
        XLocalStorage.setKey(id + "condition", condition);
    },
    
    getName: function (callback) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {'type': 'name'}, function (response) {
                callback(response);
            });
        });
    }
};