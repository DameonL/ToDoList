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
        let insertListButton = this.#rootNode.querySelector("#insertList");
        insertListButton.addEventListener("click", (event) => {
            let descriptionInput = this.#rootNode.querySelector(`[boundField="description"]`);
            let listElement = document.createElement("ul");
            let defaultItem = document.createElement("li");
            defaultItem.innerHTML = "My new list item";
            listElement.appendChild(defaultItem);
            descriptionInput.appendChild(listElement);
            let endDiv = document.createElement("div");
            endDiv.innerHTML = "&nbsp";
            descriptionInput.appendChild(endDiv);
        });

        let insertCheckListButton = this.#rootNode.querySelector("#insertList");
        insertCheckListButton.addEventListener("click", (event) => {
            let descriptionInput = this.#rootNode.querySelector(`[boundField="description"]`);
            let listElement = document.createElement("ul");
            let defaultItem = this.#CreateCheckmarkListItem();
            listElement.appendChild(defaultItem);
            descriptionInput.appendChild(listElement);
            endDiv.innerHTML = "&nbsp";
            descriptionInput.appendChild(endDiv);
        });

        documentHider.addEventListener("click", (event) => {
            this.#UpdateBackingData();
            documentHider.parentNode.removeChild(documentHider);
            cardNode.parentNode.removeChild(cardNode);
            this.#UpdateBackingData();
            this.#closedHandler();
        });

        let propertyNames = Object.keys(this.#backingData);
        propertyNames.forEach(property => {
            let boundElement = this.#rootNode.querySelector(`[${this.#bindingName}="${property}"]`);
            if (boundElement) {
                this.#boundElements.push(boundElement);

                if ((boundElement.nodeName == "DIV") || (boundElement.nodeName == "SPAN")) {
                    boundElement.innerHTML = this.#backingData[property];
                    if (!boundElement.getAttribute("multiLine")) {
                        boundElement.addEventListener("keypress", (event) => {
                            if (event.key == "Enter") {
                                event.preventDefault();
                                event.target.blur();
                            }
                        });
                    }

                    boundElement.addEventListener("keypress", (event) => {
                        if (event.key == "Enter") {
                            let selection = document.getSelection();
                            if ((selection.anchorNode != undefined)) {
                                let parent = selection.anchorNode.parentElement;
                                if (parent.firstChild.nodeName == "INPUT" && parent.firstChild.type == "checkbox") {
                                    let newCheckbox = this.#CreateCheckmarkListItem();
                                    parent.parent.appendChild(newCheckbox);
                                }
                            }
                        }
                    });

                    let checkboxes = boundElement.querySelectorAll(`input[type="checkbox"]`);
                    checkboxes.forEach(checkbox => {
                        checkbox.addEventListener("click", (event) => {
                            if (checkbox.checked)
                            {
                                checkbox.setAttribute("checked", "");
                            } else {
                                checkbox.removeAttribute("checked");
                            }
                        });
                    });
                }
                else if ((boundElement.nodeName == "INPUT") && (boundElement.getAttribute("type") == "checkbox")) {
                    boundElement.checked = this.#backingData[property];
                }
                else if ((boundElement.nodeName == "INPUT") && (boundElement.getAttribute("type") == "datetime-local")) {
                    boundElement.setAttribute("min", Date.now());
                    boundElement.setAttribute("max", "");
                    boundElement.valueAsNumber = this.#backingData[property];
                }
            }
        });
    }

    #CreateCheckmarkListItem() {
        let defaultItem = document.createElement("li");
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        defaultItem.appendChild(checkbox);
        defaultItem.innerHTML += "&nbsp";
        return defaultItem;
    }

    #UpdateBackingData() {
        for (let i = 0; i < this.#boundElements.length; i++) {
            let boundElement = this.#boundElements[i];
            let fieldName = boundElement.getAttribute(this.#bindingName);

            if ((boundElement.nodeName == "DIV") || (boundElement.nodeName == "SPAN")) {
                this.#backingData[fieldName] = boundElement.innerHTML;
            } else if ((boundElement.nodeName == "INPUT") && (boundElement.getAttribute("type") == "checkbox")) {
                this.#backingData[fieldName] = boundElement.checked;
            } else if ((boundElement.nodeName == "INPUT") && (boundElement.getAttribute("type") == "datetime-local")) {
                this.#backingData[fieldName] = boundElement.valueAsNumber;
            }
        }
    }

}