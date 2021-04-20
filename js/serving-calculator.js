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
    calculateButton.addEventListener('click', calculateDiv);
    div.appendChild(calculateButton);
    return div;
}
let calculateDiv = function(event) {
    let card = event.target.parentElement;
    let cardData = parseCard(card);
    // cardData["Starting weight"];
    // cardData["Ending weight"];
    // cardData["Serving weight"];
    // cardData["Serving count"];
    // cardData["Calories per serving"];
    // cardData["Total calories"];

    if(cardData["Starting weight"] && cardData["Ending weight"] && cardData["Serving weight"]) {
        let value = (cardData["Starting weight"] - cardData["Ending weight"]) / cardData["Serving weight"];
        cardData["Serving count"] = Math.round(value * 1000) / 1000;
    } else if(cardData["Starting weight"] && cardData["Serving weight"] && cardData["Serving count"]) {
        let value = cardData["Starting weight"] - (cardData["Serving weight"] * cardData["Serving count"]);
        cardData["Ending weight"] = Math.round(value * 1000) / 1000;
    }
    if(cardData["Calories per serving"] && cardData["Serving count"]) {
        let value = cardData["Calories per serving"] * cardData["Serving count"];
        cardData["Total calories"] = Math.round(value);
    }
    setCard(card, cardData);
    setSaveFlag();
}
let setCard = function(card, cardData) {
    let inputs = {};
    let inputsFound = document.getElementsByTagName('input');
    for(let input of inputsFound) {
        let field = input.getAttribute('field');
        if(field) {
            inputs[field] = input;
        }
    }
    for(let key of Object.keys(cardData)) {
        let cardEntry = inputs[key];
        if(cardEntry) {
            cardEntry.value = cardData[key];
        }
    }
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
        let cardData = parseCard(card);
        cardArray.push(cardData);
    }
    return cardArray;
}
let parseCard = function (card) {
    let cardData = {};
    let inputs = card.getElementsByTagName('input');
    for (let input of inputs) {
        let field = input.getAttribute('field');
        if(!field || !input.value) {
            continue;
        }
        cardData[field] = input.value;
    }
    return cardData;
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
    if(!canUseCookies) {
        return;
    }
    let cookieString = '';
    if (currentData) {
        cookieString += 'currentData=' + JSON.stringify(currentData) + ';';
    }
    cookieString += 'canUseCookies=true;';
    cookieString += 'SameSite=Strict;';
    let expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24);
    cookieString += 'expires=' + expirationDate.toUTCString() + ';';
    document.cookie = cookieString;
}
let periodicSave = setInterval(modifyStoredData, 1000);
fade();
loadCookie();