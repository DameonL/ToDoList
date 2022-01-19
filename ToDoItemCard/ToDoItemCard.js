export class ToDoItemCard {
    #bindingName = "boundField"
    #backingData = null;
    #closedHandler = null;
    #documentHider = `<div class="documentHider"></div>`;
    #cardHtml = ``;
    #rootNode = null;

    #boundElements = [];

    constructor(backingData, closedHandler) {
        this.#backingData = backingData;
        this.#closedHandler = closedHandler;
        
        fetch("./ToDoItemCard/ToDoItemCard.html").then(response => {
            return response.text();
        }).then(text => {
            this.#cardHtml = text;
            this.Render();
        });
    }

    Render() {
        let documentHider = document.createRange().createContextualFragment(this.#documentHider.trim()).firstChild;
        let cardNode = document.createRange().createContextualFragment(this.#cardHtml.trim()).firstChild;
        
        document.body.appendChild(documentHider);
        document.body.appendChild(cardNode);
        this.#rootNode = cardNode;

        documentHider.addEventListener("click", (event) => {
            this.#UpdateBackingData();
            documentHider.parentNode.removeChild(documentHider);
            cardNode.parentNode.removeChild(cardNode);
            this.#closedHandler();
        });

        let propertyNames = Object.keys(this.#backingData);
        propertyNames.forEach(property => {
            let boundElement = this.#rootNode.querySelector(`[${this.#bindingName}="${property}"]`);
            if (boundElement) {
                this.#boundElements.push(boundElement);

                if ((boundElement.nodeName == "DIV") || (boundElement.nodeName == "SPAN")) {
                    boundElement.innerHTML = this.#backingData[property];
                    boundElement.addEventListener("focusout", (event) => {
                        this.#UpdateBackingData();
                    });

                    if (!boundElement.getAttribute("multiLine")) {
                        boundElement.addEventListener("keypress", (event) => {
                            if (event.key == "Enter") {
                                event.preventDefault();
                                event.target.blur();
                            }
                        });
                    }
                }
                else if ((boundElement.nodeName == "INPUT") && (boundElement.getAttribute("type") == "checkbox")) {
                    boundElement.checked = this.#backingData[property];
                    boundElement.addEventListener("click", (event) => {
                        this.#UpdateBackingData();
                    });
                }
                else if ((boundElement.nodeName == "INPUT") && (boundElement.getAttribute("type") == "datetime-local")) {
                    let htmlDate = new Date(this.#backingData[property]);
                    htmlDate.setMinutes(htmlDate.getMinutes() - htmlDate.getTimezoneOffset());
                    htmlDate = htmlDate.toISOString().slice(0,16);
                    boundElement.value = htmlDate;
                    boundElement.addEventListener("click", (event) => {
                        this.#UpdateBackingData();
                    });
                }
            }
        });
    }

    #UpdateBackingData() {
        for (let i = 0; i < this.#boundElements.length; i++) {
            let boundElement = this.#boundElements[i];
            let fieldName = boundElement.getAttribute(this.#bindingName);
            let fieldData = this.#backingData[fieldName];
            let fieldType = (typeof fieldData);

            if ((boundElement.nodeName == "DIV") || (boundElement.nodeName == "SPAN")) {
                this.#backingData[fieldName] = boundElement.innerHTML;
            } else if ((boundElement.nodeName == "INPUT") && (boundElement.getAttribute("type") == "checkbox")) {
                this.#backingData[fieldName] = boundElement.checked;
            } else if ((boundElement.nodeName == "INPUT") && (boundElement.getAttribute("type") == "datetime-local")) {
                this.#backingData[fieldName] = Date.parse(boundElement.value);
            }
    }
    }

}