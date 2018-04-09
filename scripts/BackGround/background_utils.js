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

    getCondition: function () {
        let res = BGLocalStorage.getKey(Back_Utils.getId() + "condition");
        return res === "true";
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
            Mobile_Utils.updateMessages();
        } else if (version === "full") {
            Full_Utils.updateMessages();
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

                Mobile_Utils.initDialogInputs();
                Mobile_Utils.updateMessages();

                body_observer.observe(body, config);
                messages_observer.observe(messages, config);
            }
        });

        let messages_observer = new MutationObserver(function (mutations) {
            messages_observer.disconnect();
            Mobile_Utils.updateMessages();
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

function setCaretPosition(ctrl, pos) {
    let range = document.createRange();
    try {
        range.setStart(ctrl.childNodes[0]/* Это же textNode? */, pos);
        range.collapse(true);// совмещаем конец и начало в стартовой позиции
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } catch (e) {
    }
}

let cond;

var Full_Utils = {
    title: "Mobile_Utils",
    "private": !1,

    /**
     * Set value of fake input
     *
     * @param value
     */
    setFakeValue: function (value) {
        let fake_input = document.getElementById("fake_input");
        if (fake_input.style.display === "block" && fake_input.innerText !== value) {
            fake_input.innerText = value;
            fake_input.focus();
            setCaretPosition(fake_input, fake_input.innerText.length);
        }
    },

    /**
     *
     */
    synchronizeInputs: function (isFakeInitiator) {
        let fake = document.getElementById("fake_input");
        let original = document.getElementsByClassName("im_editable im-chat-input--text _im_text")[0];
        let res = Back_Utils.getCondition();
        let button = document.getElementsByClassName("im-send-btn im-chat-input--send _im_send")[0];

        if (res) {
            Full_Utils.changeCondition(true);
            if (isFakeInitiator) {
                original.innerText = COFFEE.encrypt(fake.innerText, Back_Utils.getKey(Back_Utils.getId()));
            } else {
                if (COFFEE.encrypt(fake.innerText, Back_Utils.getKey(Back_Utils.getId())) !== original.innerText) {
                    let newLine = COFFEE.decrypt(original.innerText, Back_Utils.getKey(Back_Utils.getId()));
                    if (newLine != null) {
                        Full_Utils.setFakeValue(newLine);
                    } else {
                        Full_Utils.setFakeValue(original.innerText);
                        original.innerText = COFFEE.encrypt(fake.innerText, Back_Utils.getKey(Back_Utils.getId()));
                    }
                }
            }
        } else {
            let newLine = COFFEE.decrypt(original.innerText, Back_Utils.getKey(Back_Utils.getId()));
            if (newLine != null) {
                original.innerText = newLine;
            }
            Full_Utils.changeCondition(false);
        }

        if (fake.innerText.length === 0) {
            try {
                if (Back_Utils.getCondition()) {
                    document.getElementsByClassName("ph_content")[0].style.display = null;
                    button.className = "im-send-btn im-chat-input--send _im_send im-send-btn_audio";
                }
            } catch (e) {
            }
        }
        else {
            try {
                document.getElementsByClassName("ph_content")[0].style.display = "none";
                button.className = "im-send-btn im-chat-input--send _im_send im-send-btn_send";
            } catch (e) {
            }
        }
    },

    changeCondition: function (enc) {
        let fake = document.getElementById("fake_input");
        let original = document.getElementsByClassName("im_editable im-chat-input--text _im_text")[0];
        if (cond !== enc) {
            cond = enc;
            if (enc === true) {
                fake.style.display = "block";
                original.style.display = "none";
                fake.focus();
                setCaretPosition(fake, fake.innerText.length);
            } else {
                fake.style.display = "none";
                original.style.display = "block";
                original.focus();
                setCaretPosition(original, original.innerText.length);
            }
        }
    },

    isLater: function () {
        let date = new Date();
        let time_before = BGLocalStorage.getKey("time_before");
        let time_after = BGLocalStorage.getKey("time_after");
        time_after = isNaN(parseInt(time_after)) ? 24 : parseInt(time_after);
        time_before = isNaN(parseInt(time_before)) ? 0 : parseInt(time_before);
        return (date.getHours() >= time_after || date.getHours() < time_before);
    },

    setLaterInput: function () {
        let fake = document.getElementById("fake_input");
        let original = document.getElementsByClassName("im_editable im-chat-input--text _im_text")[0];
        original.innerText = "Прости, но мне пора идти спать, завтра спишемся. Спокойной ночи)";
        if (fake !== null) {
            Full_Utils.synchronizeInputs(false);
        }
    },

    initDialogInputs: function () {
        let or_input, fake_input, button, id;
        id = Back_Utils.getId();

        if (id !== "" && document.getElementById("fake_input") === null) {

            or_input = document.getElementsByClassName("im_editable im-chat-input--text _im_text")[0];

            fake_input = document.createElement("div");
            fake_input.className = "im_editable im-chat-input--text _im_text";
            fake_input.setAttribute("contenteditable", "true");
            fake_input.setAttribute("tabindex", "0");
            fake_input.setAttribute("id", "fake_input");
            fake_input.setAttribute("role", "textbox");
            fake_input.setAttribute("aria-multiline", "true");
            fake_input.style.backgroundColor = "azure";
            let wrap = or_input.parentNode;

            wrap.appendChild(fake_input);

            button = document.getElementsByClassName("im-send-btn im-chat-input--send _im_send")[0];

            let config = {
                attributes: true, childList: true, characterData: true,
                subtree: true,
                attributeOldValue: true,
                characterDataOldValue: true
            };
            let obs = new MutationObserver(function (mutations) {
                obs.disconnect();
                if (Full_Utils.isLater()) {
                    Full_Utils.setLaterInput();
                } else {
                    Full_Utils.synchronizeInputs(false);
                }
                obs.observe(or_input, config);
            });
            obs.observe(or_input, config);

            fake_input.addEventListener("input", function (event) {
                if (Full_Utils.isLater()) {
                    Full_Utils.setLaterInput();
                } else {
                    Full_Utils.synchronizeInputs(true);
                }
            });

            fake_input.addEventListener("keydown", function (t) {
                let i = window, o = i.browser;
                if (10 === t.keyCode || 13 === t.keyCode && !(t.ctrlKey || t.metaKey && o.mac)) {
                    button.click();
                    t.preventDefault();
                } else if (10 === t.keyCode || 13 === t.keyCode && (t.ctrlKey || t.metaKey && o.mac)) {
                    fake_input.value += '\n';
                    let dv = document.createElement("div");
                    dv.appendChild(document.createElement("br"));
                    fake_input.appendChild(dv);
                    dv.focus();
                    setCaretPosition(dv, 0);
                    t.preventDefault();
                }
            });

            or_input.addEventListener("focus", function (e) {
                if (Back_Utils.getCondition()) {
                    fake_input.focus();
                    setCaretPosition(fake_input, fake_input.innerText.length);
                }
            });

            button.addEventListener('click', function (e) {
                Full_Utils.setFakeValue("");
            })
        }

    },

    start: function () {
        //Тело всей страницы
        let body = document.getElementsByTagName("body")[0];
        let messages = "";
        let dialogName = "";

        let messages_observer = new MutationObserver(function (mutations) {
            messages_observer.disconnect();
            Full_Utils.updateMessages();
            messages_observer.observe(document.getElementsByClassName("_im_peer_history im-page-chat-contain")[0], config);
        });

        let body_observer = new MutationObserver(async function (mutations) {
            let message_block;

            message_block = document.getElementsByClassName("_im_peer_history im-page-chat-contain");
            let id = Back_Utils.getId();

            if (id === "") {
                messages_observer.disconnect();
                messages = "";
                cond = null;
            } else if (messages !== id) {
                messages = id;
                body_observer.disconnect();

                Full_Utils.initDialogInputs();
                Full_Utils.updateMessages();
                Full_Utils.synchronizeInputs(false);

                body_observer.observe(body, config);
                messages_observer.observe(message_block[0], config);
            }
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

    updateMessages: function () {
        let id = Back_Utils.getId();
        if (id !== "") {
            let key = Back_Utils.getKey(id);
            Back_Utils.decrypt(key, document.getElementsByClassName("im-mess--text wall_module _im_log_body"));
        }
    }
}