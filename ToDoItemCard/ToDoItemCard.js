import { TextEditor } from "../TextEditor/TextEditor.js";

export class ToDoItemCard {
    #bindingName = "boundField"
    #backingData = null;
    #closedHandler = null;
    #documentHiderHtml = `<div class="documentHider"></div>`;
    #cardHtml = ``;
    #documentHiderInstance = null;
    #rootNode = null;
    #backspaceListener = null;
    #lastFocusedField = null;
    #lastFocusedFieldPosition = 0;
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
        let documentHiderInstance = document.createRange().createContextualFragment(this.#documentHiderHtml.trim()).firstChild;
        this.#documentHiderInstance = documentHiderInstance;
        let cardNode = document.createRange().createContextualFragment(this.#cardHtml.trim()).firstChild;
        
        document.body.appendChild(documentHiderInstance);
        document.body.appendChild(cardNode);
        this.#rootNode = cardNode;
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
        }

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
                    } else {
                        let textEditor = new TextEditor();
                        textEditor.AttachTo(boundElement);
                    }
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