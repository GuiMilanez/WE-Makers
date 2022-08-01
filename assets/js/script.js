import {
    data
} from "./clients.mjs";
var referenceObject = {};
var referenceObjectCl = {};
var referenceObjectClName = {};
var clients = [];
var convertlang = [];
var convertlangName = [];
autoComplete();

function autoComplete() {
    let client = data()
    referenceObject = {};
    referenceObjectCl = {};
    referenceObjectClName = {};
    clients = [];
    convertlang = [];
    convertlangName = [];
    client.forEach(element => {
        if (element.client_active) {
            clients.push(element.client_name)
            convertlang.push(element.client_cl)
            convertlangName.push(element.client_cl_name)
            referenceObject[element.client_name] = element.client_id
            referenceObjectCl[element.client_name] = element.client_cl
            referenceObjectClName[element.client_name] = element.client_cl_name
        }
    })

    $('#queryValue').autocomplete({
        source: function (request, response) {
            var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
            response(
                $.grep(clients, function (item) {
                    return matcher.test(item);
                })
            )
        },
        minLength: 2,
        position: {
            collision: 'flip'
        }
    })
    $('#convertlang').autocomplete({
        source: function (request, response) {
            var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
            response(
                $.grep(convertlang, function (item) {
                    return matcher.test(item);
                })
            )
        },
        minLength: 2,
        position: {
            collision: 'flip'
        }
    })
}

function populateId(e) {
    if (document.getElementById('populated-container').dataset.display == "1") {
        toggleDisplay('populated-container')
        document.getElementById('convertlang').innerHTML = ""
        document.getElementById('clientId').innerHTML = ""
    }
    let autocomplete = document.getElementById('queryValue')
    if (autocomplete.value in referenceObject && autocomplete.id === event.target.id) {
        toggleDisplay('populated-container')
        document.getElementById('clientId').innerHTML = referenceObject[autocomplete.value]
        if (referenceObjectCl[autocomplete.value].length > 1) {
            let olEl = document.createElement('ol');
            olEl.classList.add('list-group')
            document.getElementById('convertlang').appendChild(olEl);
            referenceObjectCl[autocomplete.value].forEach(element => {
                let liEl = document.createElement('li')
                liEl.classList.add('list-group-item')
                liEl.innerHTML = " " + element
                olEl.appendChild(liEl)
            })
        } else {
            document.getElementById('convertlang').innerHTML = referenceObjectCl[autocomplete.value]
        }
        // document.getElementById('convertlangName').innerHTML = referenceObjectClName[autocomplete.value]
    }
}

function resetForm() {
    toggleDisplay('populated-container')
    document.getElementById("uptime").reset()
}

$('.add').on('click', add);
$('.remove').on('click', remove);

function add() {
    var new_chq_no = parseInt($('#total_cl').val()) + 1;
    let divEl = createConvertLanguageField(new_chq_no)
    $('#new_chq').append(divEl);
    $('#total_cl').val(new_chq_no);
}

function createConvertLanguageField(new_chq_no) {
    //Create buttons 
    let divEl = document.createElement('div')
    divEl.id = 'new_' + new_chq_no
    divEl.classList.add('input-group', 'mb-3')

    let inputEl1 = document.createElement('input');
    inputEl1.type = 'text';
    inputEl1.classList.add('form-control')
    inputEl1.placeholder = 'ConvertLanguage'
    inputEl1.setAttribute('aria-label', 'ConvertLanguage')

    let inputEl2 = document.createElement('input');
    inputEl2.type = 'text';
    inputEl2.classList.add('form-control')
    inputEl2.placeholder = 'Client ID'
    inputEl2.setAttribute('aria-label', 'Client ID')

    let anchorEl = document.createElement('a');
    anchorEl.classList.add('btn', 'btn-danger', 'btn-sm', 'remove')
    anchorEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
        < path d = "M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
</svg >`

    anchorEl.addEventListener('click', remove)
    divEl.appendChild(inputEl1)
    divEl.appendChild(inputEl2)
    divEl.appendChild(anchorEl)

    return divEl
}

function remove() {
    var last_chq_no = $('#total_cl').val();
    if (last_chq_no > 1) {
        $('#new_' + last_chq_no).remove();
        $('#total_cl').val(last_chq_no - 1);
    }
}

function submit(e) {
    e.preventDefault();
    // if (validate()) {
        let form = document.getElementById('uptime')
        console.log(document.getElementById("clientId"))
        let serverType = "";
        let tserver = true;
        tserver ? serverType = "TSERVER: " : "";
        let formData = {
            client_id: document.getElementById("clientId").value,
            client_name: form.queryValue.value,
            client_cl: form.convertlang.value,
            client_cl_name: form.convertlangName.value
        }
        fetch(form.action, {
            method: "POST",
            mode: 'cors',
            body: JSON.stringify({
                device: {
                    name: new String(serverType) + formData.client_name + new String(', ') + formData.client_cl_name + new String(' #') + formData.client_id
                },
                task: {
                    url: new String('https://') + formData.client_cl + new String('/?mpactionid=1')
                }
            }),
            //body: JSON.stringify(formData),
            headers: {
                'content-type': 'application/json'
            }
        }).then(
            response => response.json()
        ).then((html) => {
            window.open('page2.html', '_blank');
        });
    // } else {
        // alert('Incorrect Information')
        // return resetForm();
    // }
}

function validate() {
    if (!document.getElementById('clientId').value) {
        populateId()
    } else if (clients.indexOf(document.getElementById('queryValue').value) == -1) {
        return alert('Client not found')
    } else if (referenceObject[document.getElementById('queryValue').value] != document.getElementById('clientId').value) {
        populateId()
    } else {
        return true
    }
}

function toggleDisplay(id) {
    let idElement = document.getElementById(id)
    if (idElement.dataset.display == false) {
        idElement.classList.replace('hide', 'show')
        idElement.dataset.display = "1"
    } else if (idElement.dataset.display == true) {
        idElement.classList.replace('show', 'hide')
        idElement.dataset.display = "0"
    }
}
// toggleDisplay('populated-container')

document.getElementById(`${'queryValue' || 'convertlang'}`).addEventListener('blur', populateId);
document.getElementById('uptime').addEventListener('submit', submit);
document.getElementById('resetBtn').addEventListener('click', function (e) {
    resetForm()
});
// document.getElementById('inactiveClients').addEventListener('change', autoComplete);