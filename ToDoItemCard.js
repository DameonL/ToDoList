export class ToDoItemCard {
    #bindingName = "boundField"
    #backingData = null;
    #closedHandler = null;
    #documentHider = `<div class="documentHider"></div>`;
    #cardHtml = ``;

    #boundElements = [];

    constructor(backingData, closedHandler) {
        this.#backingData = backingData;
        this.#closedHandler = closedHandler;
        
        fetch("ToDoItemCard.html").then(response => {
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

        documentHider.addEventListener("click", (event) => {
            this.#UpdateBackingData();
            documentHider.parentNode.removeChild(documentHider);
            cardNode.parentNode.removeChild(cardNode);
            this.#closedHandler();
        });

        let propertyNames = Object.keys(this.#backingData);
        propertyNames.forEach(property => {
            let boundElement = document.querySelector(`[${this.#bindingName}="${property}"]`);
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
            }
        });
    }

    #UpdateBackingData() {
        for (let i = 0; i < this.#boundElements.length; i++) {
            let boundElement = this.#boundElements[i];
            let fieldName = boundElement.getAttribute(this.#bindingName);
            let fieldData = this.#backingData[fieldName];
            let fieldType = (typeof fieldData);

            if (fieldType == "string") {
                this.#backingData[fieldName] = boundElement.innerHTML;
            } else if (fieldType == "boolean") {
                this.#backingData[fieldName] = boundElement.checked;
            }
        }
    }

}