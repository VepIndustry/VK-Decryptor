let Back_Utils = {
    title: "Back_Utils",
    "private": !1,

    getId: function () {
        let tabUrl = document.location.href;

        let sel_reg = /(peer=[^&]+)|(chat=[^&]+)/;
        let m = tabUrl.match(sel_reg);
        if (m != null) {
            let sel = tabUrl.match(sel_reg)[0];
            return sel.substring("peer=".length);
        } else {
            return "";
        }
    },

    getKey: function (id) {
        let password = BGLocalStorage.getKey(id);
        if (password === standartKey || (typeof password === 'undefined' || password === null || password === "")) {
            return standartKey;
        } else {
            return password.toString().substr(0, 16);
        }
    }

};