const Constants = {};
Constants.startingWeight = "Starting weight";
Constants.endingWeight = "Ending weight"
let copyTimeout = undefined;
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
let createNewCalculationDiv = function(title, startingWeight, endingWeight) {
    let div = document.createElement("div");
    div.classList.add('card');
    let closeButton = document.createElement('button');
    closeButton.classList.add('close');
    closeButton.innerText = '\u00D7';
    div.appendChild(closeButton);
    createLabeledInput(div, "Title", title);
    createLabeledInput(div, "Starting weight", startingWeight, "numeric", 'g');
    createLabeledInput(div, "Ending weight", endingWeight, "numeric", 'g');
    createLabeledInput(div, "Serving weight", endingWeight, "numeric", 'g');
    createLabeledInput(div, "Serving count", endingWeight, "numeric");
    createLabeledInput(div, "Calories per serving", endingWeight, "numeric");
    createLabeledInput(div, "Total calories", endingWeight, "numeric");
    return div;
}
let createLabeledInput = function(div, name, value, inputmode, unit) {
    let subDiv = document.createElement("div");
    subDiv.classList.add('block');
    let label = document.createElement("label");
    label.innerText = name + ": ";
    let input = document.createElement('input');
    input.setAttribute('type', 'text');
    if(value) {
        input.value = value;
    }
    if(inputmode) {
        input.setAttribute("inputmode", inputmode);
    }
    subDiv.appendChild(label);
    subDiv.appendChild(input);
    if(unit) {
        let unitLabel = document.createElement("label");
        unitLabel.innerText = " " + unit;
        subDiv.appendChild(unitLabel);
    }
    div.appendChild(subDiv);
}
fade();