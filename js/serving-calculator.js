const Constants = {};
Constants.startingWeight = "Starting weight";
Constants.endingWeight = "Ending weight"
let canUseCookies = false;
let copyTimeout = undefined;
let currentData = [];
let saveFlag = false;
let startGradualFade = function (element) {
    element.style.opacity = 1;
    clearTimeout(copyTimeout);
    copyTimeout = setTimeout(gradualFade, 10, element);
};
let gradualFade = function (element) {
    element.style.opacity -= 0.01;
    if (element.style.opacity > 0) {
        copyTimeout = setTimeout(gradualFade, 10, element);
    } else {
        element.style.display = 'none';
        copyTimeout = undefined;
        element.remove();
    }
};
let fade = function () {
    let fadeDiv = document.getElementById("fade");
    if (fadeDiv) {
        startGradualFade(fadeDiv);
    }
};
let addNew = function () {
    let servingsDiv = document.getElementById('servings');
    let calculationDiv = createNewCalculationDiv();
    servingsDiv.appendChild(calculationDiv);
}
let createNewCalculationDiv = function (json) {
    let div = document.createElement("div");
    div.classList.add('card');
    let closeButton = document.createElement('button');
    closeButton.classList.add('close');
    closeButton.innerText = '\u00D7';
    closeButton.addEventListener('click', closeCalculationDiv);
    div.appendChild(closeButton);
    createLabeledInput(div, "Title", json);
    createLabeledInput(div, "Starting weight", json, "numeric", 'g');
    createLabeledInput(div, "Ending weight", json, "numeric", 'g');
    createLabeledInput(div, "Serving weight", json, "numeric", 'g');
    createLabeledInput(div, "Serving count", json, "numeric");
    createLabeledInput(div, "Calories per serving", json, "numeric");
    createLabeledInput(div, "Total calories", json, "numeric");
    let calculateButton = document.createElement('button');
    calculateButton.innerText = 'Calculate';
    calculateButton.style.float = 'right';
    div.appendChild(calculateButton);
    return div;
}
let closeCalculationDiv = function (event) {
    let button = event.target;
    button.parentElement.remove();
    setSaveFlag();
}
let createLabeledInput = function (div, name, valueJson, inputmode, unit) {
    let subDiv = document.createElement("div");
    subDiv.classList.add('block');
    let label = document.createElement("label");
    label.innerText = name + ": ";
    let input = document.createElement('input');
    input.setAttribute('field', name);
    input.setAttribute('type', 'text');
    input.addEventListener('change', setSaveFlag);
    input.addEventListener('input', setSaveFlag);
    if (valueJson && valueJson[name]) {
        input.value = valueJson[name];
    }
    if (inputmode) {
        input.setAttribute("inputmode", inputmode);
    }
    subDiv.appendChild(label);
    subDiv.appendChild(input);
    if (unit) {
        let unitLabel = document.createElement("label");
        unitLabel.innerText = " " + unit;
        subDiv.appendChild(unitLabel);
    }
    div.appendChild(subDiv);
}
let setSaveFlag = function (event) {
    saveFlag = true;
}
let modifyStoredData = function (event) {
    if (!saveFlag) {
        return;
    }
    currentData = getArrayOfInputs();
    writeCookie();
}
let getArrayOfInputs = function () {
    let cardArray = [];
    let cards = document.getElementsByClassName('card');
    for (let card of cards) {
        let cardData = {};
        let inputs = card.getElementsByTagName('input');
        for (let input of inputs) {
            let field = input.getAttribute('field');
            if(!field || !input.value) {
                continue;
            }
            cardData[field] = input.value;
        }
        cardArray.push(cardData);
    }
    return cardArray;
}
let cookiesEnabled = function (enabled) {
    canUseCookies = enabled;
    let consentBanner = document.getElementById('consent-banner');
    consentBanner.remove();
    if (canUseCookies) {
        loadCookie();
        writeCookie();
    }
}
let loadCookie = function () {
    if (document.cookie) {
        banner = document.getElementById('consent-banner');
        banner.remove();
        canUseCookies = true;
        let cookieValues = parseCookie(document.cookie);
        if (cookieValues.hasOwnProperty('currentData')) {
            currentData = JSON.parse(cookieValues.currentData);
        }
        createBoxesFromCookie();
    }
}
let createBoxesFromCookie = function() {
    let servingsDiv = document.getElementById('servings');
    for(let boxData of currentData) {
        let calculationDiv = createNewCalculationDiv(boxData);
        servingsDiv.appendChild(calculationDiv);
    }
}
let parseCookie = function (cookieString) {
    let output = {};
    let cookieParts = cookieString.split(';');
    for (let cookiePart of cookieParts) {
        let keyValue = cookiePart.split('=');
        let key = keyValue[0].trim();
        let value = keyValue[1].trim();
        output[key] = value;
    }
    return output;
}
let writeCookie = function () {
    let cookieString = '';
    if (currentData) {
        cookieString += 'currentData=' + JSON.stringify(currentData) + ';';
    }
    cookieString += 'canUseCookies=true;';
    cookieString += 'SameSite=Strict;';
    document.cookie = cookieString;
}
let periodicSave = setInterval(modifyStoredData, 1000);
fade();
loadCookie();