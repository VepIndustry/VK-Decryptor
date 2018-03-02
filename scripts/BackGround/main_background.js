function upd(key, qt) {
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
}

function update(key) {
    upd(key, document.getElementsByClassName("mi_text"));
    upd(key, document.getElementsByClassName("msg__text"));
}

function refresh() {
    let id = Back_Utils.getId();
    if (id !== "") {
        let key = Back_Utils.getKey(id);
        update(key);
    }
}

//Тело всей страницы
let body = document.getElementsByTagName("body")[0];

//Контейнер с сообщениями
let messages;
let or_input;
let fake_input;
let button;

function init() {

    let id = Back_Utils.getId();


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
            let res = BGLocalStorage.getKey("condition");
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


}

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

        init();
        refresh();

        body_observer.observe(body, config);
        messages_observer.observe(messages, config);
    }
});

let messages_observer = new MutationObserver(function (mutations) {
    messages_observer.disconnect();
    refresh();
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