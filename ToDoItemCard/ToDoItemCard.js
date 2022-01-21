export class ToDoItemCard {
    #bindingName = "boundField"
    #backingData = null;
    #closedHandler = null;
    #documentHiderHtml = `<div class="documentHider"></div>`;
    #cardHtml = ``;
    #documentHiderInstance = null;
    #rootNode = null;
    #backspaceListener = null;
    #focusChangeEvent = (event) => {
        console.log(event);
    }

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

    #CloseWindow() {
        this.#UpdateBackingData();
        this.#documentHiderInstance.parentNode.removeChild(this.#documentHiderInstance);
        this.#rootNode.parentNode.removeChild(this.#rootNode);
        document.removeEventListener("keydown", this.#backspaceListener);
        this.#backspaceListener = null;
        this.#closedHandler();
    }

    #CloseListener(event) {
        if ((event.key == "Backspace") && (event.srcElement.nodeName == "BODY")) {
            window.location.hash = "";
            return;
        }
    }

    Render() {
        if (this.#backspaceListener == null) {
            this.#backspaceListener = this.#CloseListener.bind(this);
            let hashChangeEvent = (event) => {
                if (window.location.hash != "toDoItemCard") {
                    window.onhashchange = null;
                    this.#CloseWindow();
                }
            }
            window.onhashchange = hashChangeEvent;
            document.addEventListener("keydown", this.#backspaceListener);
            window.addEventListener("focus", this.#focusChangeEvent);
        }

        let documentHiderInstance = document.createRange().createContextualFragment(this.#documentHiderHtml.trim()).firstChild;
        this.#documentHiderInstance = documentHiderInstance;
        let cardNode = document.createRange().createContextualFragment(this.#cardHtml.trim()).firstChild;
        
        document.body.appendChild(documentHiderInstance);
        document.body.appendChild(cardNode);
        this.#rootNode = cardNode;
        let insertListButton = this.#rootNode.querySelector("#insertList");
        insertListButton.addEventListener("click", (event) => {
            let selection = document.selection;
            let descriptionInput = this.#rootNode.querySelector(`[boundField="description"]`);
            let listElement = document.createElement("ul");
            let defaultItem = document.createElement("li");
            defaultItem.innerHTML = "My new list item";
            listElement.appendChild(defaultItem);
            descriptionInput.appendChild(listElement);
            document.getSelection().collapse(defaultItem, 1);
        });

        let insertCheckListButton = this.#rootNode.querySelector("#insertCheckList");
        insertCheckListButton.addEventListener("click", (event) => {
            let descriptionInput = this.#rootNode.querySelector(`[boundField="description"]`);
            let listElement = document.createElement("ul");
            let defaultItem = this.#CreateCheckmarkListItem();
            listElement.appendChild(defaultItem);
            descriptionInput.appendChild(listElement);
        });

        documentHiderInstance.addEventListener("click", () => window.location.hash = "");

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
                                let listNode = selection.anchorNode.parentElement;
                                if (listNode.firstChild.nodeName == "INPUT" && listNode.firstChild.type == "checkbox") {
                                    if (listNode.innerText.trim() == "") {
                                        let afterDiv = document.createElement("div");
                                        afterDiv.innerHTML = "&nbsp;";
                                        listNode.parentElement.after(afterDiv);
                                        listNode.parentElement.removeChild(listNode);
                                        selection.collapse(afterDiv, 1);
                                        event.preventDefault();
                                        return false;
                                    }

                                    let newCheckbox = this.#CreateCheckmarkListItem();
                                    listNode.after(newCheckbox);
                                    selection.modify("move", "right", "line");
                                    event.preventDefault();
                                    return false;
                                }
                            }
                        }
                    });

                    boundElement.addEventListener("keydown", (event) => {
                        if (event.key == "Backspace") {
                            let selection = document.getSelection();
                            let selectionRange = selection.getRangeAt(0);
                            if ((selectionRange.startOffset == 1) && (selectionRange.startContainer.nodeName == "LI") && (selectionRange.startContainer.firstChild.type == "checkbox")) {
                                selection.modify("move", "left", "word");
                                selectionRange.startContainer.parentElement.removeChild(selectionRange.startContainer);
                                event.preventDefault();
                                return false;
                            }

                            let anchorNode = document.getSelection().anchorNode;
                            if (anchorNode != undefined && anchorNode.previousSibling == null && anchorNode.parentElement.nodeName == "UL") {
                                event.preventDefault();
                                anchorNode.parentElement.parentElement.removeChild(anchorNode.parentElement);
                                return false;
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
        defaultItem.className = "checkList";
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