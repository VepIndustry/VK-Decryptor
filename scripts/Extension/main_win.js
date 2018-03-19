function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function setHinter(input, hinter, key) {
    if (key.length === 0) {
        input.style.color = "darkseagreen";
        hinter.innerText = null;
    } else if (key.length < 4) {
        input.style.color = "red";
        hinter.innerText = "Password must be longer for VK Coffee";
    } else if (key.length > 16) {
        input.style.color = "red";
        hinter.innerText = "Password must be shorter for VK Coffee";
    } else if (!isNumber(key)) {
        input.style.color = "red";
        hinter.innerText = "Password must be a number for VK Coffee";
    } else {
        input.style.color = "darkseagreen";
        hinter.innerText = null;
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    let id_label = document.getElementById('user_id');
    let name_label = document.getElementById('user_name');
    let btn_add = document.getElementById('turn');
    let input = document.getElementById('key');
    let hinter = document.getElementById('hinter');

    let id;
    Main_Utils.getId(function (i) {
        id = i;
        id_label.innerText = id;

        Main_Utils.getPassword(i, function (pass) {
            if (pass.length === 0) {
                input.placeholder = "Standard password";
            } else {
                input.value = pass;
            }
            setHinter(input, hinter, pass);
        });
        Main_Utils.getCondition(id, function (condition) {
            if (condition === true) {
                btn_add.style.background = "red";
                btn_add.value = "On";
            } else {
                btn_add.style.background = "black";
                btn_add.value = "Off";
            }
        })
    });

    Main_Utils.getName(function (i) {
        name_label.innerText = i;
    });

    input.addEventListener("input", function () {
        let key = input.value;
        Main_Utils.setKey(id, key);
        setHinter(input, hinter, key);
        Main_Utils.getPassword(id, function (pass) {
            if (pass.length === 0) {
                input.placeholder = "Standard password";
            } else {
                input.value = pass;
            }
        });
    });

    btn_add.addEventListener("click", function () {
        if (btn_add.value === "On") {
            btn_add.style.background = "black";
            btn_add.value = "Off";
            Main_Utils.setCondition(id, false);
        } else {
            btn_add.style.background = "red";
            btn_add.value = "On";
            Main_Utils.setCondition(id, true);
        }
    })
});

