var Back_Utils = {
    title: "Back_Utils",
    "private": !1,

    getUrl: function () {
        return document.location.href;
    },

    getVersion: function (url) {
        if (url.includes("m.vk.com")) {
            return "mobile";
        } else if (url.includes("vk.com")) {
            return "full";
        } else {
            return "none";
        }
    },

    getId: function () {
        let tabUrl = document.location.href;

        if (Main_Utils.getVersion(tabUrl) === "mobile") {
            let sel_reg = /(peer=[^&]+)|(chat=[^&]+)/;
            let m = tabUrl.match(sel_reg);
            if (m != null) {
                let sel = tabUrl.match(sel_reg)[0];
                return sel.substring("peer=".length);
            } else {
                return "";
            }
        } else if (Main_Utils.getVersion(tabUrl) === "full") {
            let sel_reg = /sel=[^&]+/;
            let m = tabUrl.match(sel_reg);
            if (m != null) {
                let sel = tabUrl.match(sel_reg)[0].substring("sel=".length);
                if (sel.startsWith("c")) {
                    return sel.substr(1);
                } else {
                    return sel;
                }
            } else {
                return "";
            }
        }
    },

    getKey: function (id) {
        let password = BGLocalStorage.getKey(id);
        if (password === standartKey || (typeof password === 'undefined' || password === null || password === "")) {
            return standartKey;
        } else {
            return password.toString().substr(0, 16);
        }
    },

    decrypt: function (key, qt) {
        for (let i = 0; i < qt.length; i++) {
            let nodes = qt[i].childNodes;
            for (let j = 0; j < nodes.length; j++) {
                if (nodes[j].nodeType === 3 && nodes[j].data.length !== 0) {
                    try {
                        let newLine = COFFEE.decrypt(nodes[j].nodeValue + "", key);
                        if (newLine != null) {
                            nodes[j].replaceData(0, nodes[j].length, newLine);
                            qt[i].id = "changed";
                        }
                    } catch (e) {
                    }
                }
            }
        }
    },

    update: function () {
        let version = Back_Utils.getVersion(Back_Utils.getUrl());
        if (version === "mobile") {
            Mobile_Utils.update();
        } else if (version === "full") {
            Full_Utils.update();
        }
    }

};

var Mobile_Utils = {
    title: "Mobile_Utils",
    "private": !1,

    init: function () {
        let or_input, fake_input, button, id;
        id = Back_Utils.getId();

        if (id !== "") {
            or_input = document.getElementsByName("message")[0];
            or_input.style.display = "none";
            fake_input = document.createElement("textarea");
            if (document.getElementsByClassName("uMailWrite__textarea").length > 0) {
                fake_input.classList.add("uMailWrite__textarea");
                fake_input.placeholder = "Ваше сообщение";
            } else {
                fake_input.classList.add("textfield");
            }

            fake_input.rows = 3;
            fake_input.focus();

            let wrap = or_input.parentNode;
            wrap.appendChild(fake_input);
            button = document.getElementById("write_submit");
            if (button === null) {
                button = document.getElementsByClassName("uMailWrite__button uMailWrite__button_send")[0];
            }

            fake_input.addEventListener("input", function (event) {
                let res = BGLocalStorage.getKey(id + "condition");
                if (res === "true") {
                    or_input.value = COFFEE.encrypt(fake_input.value, Back_Utils.getKey(id));
                } else {
                    or_input.value = fake_input.value;
                }
            });

            fake_input.addEventListener("keydown", function (t) {
                let i = window, o = i.browser;
                if (10 === t.keyCode || 13 === t.keyCode && !(t.ctrlKey || t.metaKey && o.mac)) {
                    button.click();
                    t.preventDefault();
                } else if (10 === t.keyCode || 13 === t.keyCode && (t.ctrlKey || t.metaKey && o.mac)) {
                    fake_input.value += '\n';
                    t.preventDefault();
                }
            });

            button.addEventListener('click', function (e) {
                fake_input.value = "";
            })
        }

    },

    start: function () {
        //Тело всей страницы
        let body = document.getElementsByTagName("body")[0];

        let body_observer = new MutationObserver(async function (mutations) {
            let message_block;

            message_block = document.getElementsByClassName("messages bl_cont");
            if (message_block.length === 0) {
                message_block = document.getElementsByClassName("mailScrap__items mailScrap__items_peer");
            }

            if (message_block.length === 0) {
                messages_observer.disconnect();
            } else if (message_block.length !== 0 && messages !== message_block[0]) {
                messages = message_block[0];
                body_observer.disconnect();

                Mobile_Utils.init();
                Mobile_Utils.update();

                body_observer.observe(body, config);
                messages_observer.observe(messages, config);
            }
        });

        let messages_observer = new MutationObserver(function (mutations) {
            messages_observer.disconnect();
            Mobile_Utils.update();
            messages_observer.observe(messages, config);
        });

        let config = {
            attributes: true, childList: true, characterData: true,
            subtree: true,
            attributeOldValue: true,
            characterDataOldValue: true
        };

        body_observer.observe(body, config);
        body.title = body.title + " ";
    },

    update: function () {
        let id = Back_Utils.getId();
        if (id !== "") {
            let key = Back_Utils.getKey(id);
            Back_Utils.decrypt(key, document.getElementsByClassName("mi_text"));
            Back_Utils.decrypt(key, document.getElementsByClassName("msg__text"));
        }
    }
};

var Full_Utils = {
    title: "Mobile_Utils",
    "private": !1,

    init: function () {
        let or_input, fake_input, button, id, placeholder;
        id = Back_Utils.getId();

        if (id !== "" && document.getElementById("fake_input") === null) {

            or_input = document.getElementsByClassName("im_editable im-chat-input--text _im_text")[0];
            or_input.style.display = "none";

            fake_input = document.createElement("div");
            fake_input.className = "im_editable im-chat-input--text _im_text";
            fake_input.setAttribute("contenteditable", "true");
            fake_input.setAttribute("tabindex", "0");
            fake_input.setAttribute("id", "fake_input");
            fake_input.setAttribute("role", "textbox");
            fake_input.setAttribute("aria-multiline", "true");
            fake_input.style.backgroundColor = "aquamarine";
            fake_input.focus();

            let wrap = or_input.parentNode;
            wrap.appendChild(fake_input);

            button = document.getElementsByClassName("im-send-btn im-chat-input--send _im_send")[0];
            console.log(button);

            let obs = new MutationObserver(function (mutations) {
                let text = COFFEE.decrypt(or_input.innerText, Back_Utils.getKey(Back_Utils.getId()));
                if (text !== null && typeof text !== 'undefined') {
                    if (fake_input.innerText !== text) {
                        fake_input.innerText = text;
                        fake_input.focus();
                    }
                } else {
                    if (fake_input.innerText !== or_input.innerText) {
                        fake_input.innerText = or_input.innerText;
                        fake_input.focus();
                    }
                }
            });
            let config = {
                attributes: true, childList: true, characterData: true,
                subtree: true,
                attributeOldValue: true,
                characterDataOldValue: true
            };
            obs.observe(or_input, config);

            or_input.addEventListener("onchange", function (event) {
                let text = COFFEE.decrypt(or_input.innerText, Back_Utils.getKey(Back_Utils.getId()));
                if (text !== null) {
                    fake_input.innerText = text;
                } else {
                    fake_input.innerText = or_input.innerText;
                }
            });

            fake_input.addEventListener("input", function (event) {
                let res = BGLocalStorage.getKey(Back_Utils.getId() + "condition");
                if (fake_input.innerText.length === 0) {
                    document.getElementsByClassName("ph_content")[0].style.display = null;
                    button.className = "im-send-btn im-chat-input--send _im_send im-send-btn_audio";
                } else {
                    document.getElementsByClassName("ph_content")[0].style.display = "none";
                    button.className = "im-send-btn im-chat-input--send _im_send im-send-btn_send";
                }
                if (res === "true") {
                    fake_input.style.backgroundColor = "aquamarine";
                    or_input.innerText = COFFEE.encrypt(fake_input.innerText, Back_Utils.getKey(Back_Utils.getId()));
                } else {
                    fake_input.style.backgroundColor = "darkseagreen";
                    or_input.innerText = fake_input.innerText;
                }
            });

            fake_input.addEventListener("keydown", function (t) {
                let i = window, o = i.browser;
                if (10 === t.keyCode || 13 === t.keyCode && !(t.ctrlKey || t.metaKey && o.mac)) {
                    button.click();
                    t.preventDefault();
                } else if (10 === t.keyCode || 13 === t.keyCode && (t.ctrlKey || t.metaKey && o.mac)) {
                    fake_input.value += '\n';
                    t.preventDefault();
                }
            });

            button.addEventListener('click', function (e) {
                fake_input.innerText = "";
            })
        }

    },

    start: function () {
        //Тело всей страницы
        let body = document.getElementsByTagName("body")[0];
        let messages = "";
        let body_observer = new MutationObserver(async function (mutations) {
            let message_block;

            message_block = document.getElementsByClassName("_im_peer_history im-page-chat-contain");
            let id = Back_Utils.getId();

            if (id === "") {
                messages_observer.disconnect();
                messages = "";
            } else if (messages !== id) {
                messages = id;
                body_observer.disconnect();

                Full_Utils.init();
                Full_Utils.update();

                body_observer.observe(body, config);
                messages_observer.observe(message_block[0], config);
            }
        });

        let messages_observer = new MutationObserver(function (mutations) {
            messages_observer.disconnect();
            Full_Utils.update();
            messages_observer.observe(document.getElementsByClassName("_im_peer_history im-page-chat-contain")[0], config);
        });

        let config = {
            attributes: true, childList: true, characterData: true,
            subtree: true,
            attributeOldValue: true,
            characterDataOldValue: true
        };

        body_observer.observe(body, config);
        body.title = body.title + " ";
    },

    update: function () {
        let id = Back_Utils.getId();
        if (id !== "") {
            let key = Back_Utils.getKey(id);
            Back_Utils.decrypt(key, document.getElementsByClassName("im-mess--text wall_module _im_log_body"));
        }
    }
}