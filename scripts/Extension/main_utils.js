let standartKey = "stupidUsersMustD";

var Main_Utils = {
    title: "Main_Utils",
    "private": !1,

    getId: function (callback) {
        chrome.tabs.query({
            active: true
        }, function (tabsArray) {
            let tab = tabsArray[0];
            let tabUrl = tab.url;

            let sel_reg = /(peer=[^&]+)|(chat=[^&]+)/;
            let sel = tabUrl.match(sel_reg)[0];
            callback(sel.substring("peer=".length));
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
    }
};