export class ArrangeableListItem {
    #backingData = null;
    #renderRoot = null;
    #listDefinition = null;
    #boundElements = [];
    #buttonRoot = null;
    #boundEventHandlers = [];

    get Index() { return this.#listDefinition.itemIndexHandler(this.#backingData); }

    constructor(backingData, listDefinition) {
        this.#backingData = backingData;
        this.#listDefinition = listDefinition;
        this.#renderRoot = this.#CreateRootNode();
        this.#CreateButtonSpan();
        this.Redraw();
    }

    get Renderer() {
        return this.#renderRoot;
    }

    #CreateButtonSpan() {
        this.#buttonRoot = document.createElement("div");
        this.#listDefinition.itemButtonDefinitions.forEach(definition => {
            let button = document.createElement("span");
            button.innerHTML = definition.label;
            button.style.cursor = "pointer";
            button.addEventListener("click", (event) => { definition.clickedHandler(this.#backingData); });
            this.#buttonRoot.appendChild(button);
        });
    }

    Redraw() {
        this.#renderRoot = this.#CreateRootNode();

        this.#boundElements = [];

        let propertyNames = Object.keys(this.#backingData);
        propertyNames.forEach(property => {
            let boundElement = this.#renderRoot.querySelector(`[boundField="${property}"]`);
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
                    let focusout = () => { 
                        this.#UpdateBackingData(); 
                    }
                    boundElement.addEventListener("focusout", focusout);
                }
                else if ((boundElement.nodeName == "INPUT") && (boundElement.getAttribute("type") == "checkbox")) {
                    boundElement.checked = this.#backingData[property];
                    boundElement.addEventListener("change", () => {
                        this.#UpdateBackingData();
                    });
                }
                else if ((boundElement.nodeName == "INPUT") && (boundElement.getAttribute("type") == "datetime-local")) {
                    boundElement.setAttribute("min", Date.now());
                    boundElement.setAttribute("max", "");
                    boundElement.valueAsNumber = this.#backingData[property];
                    boundElement.addEventListener("change", () => {
                        this.#UpdateBackingData();
                    });
                }
            }
        });

        this.#UpdateAppearance();
    }

    #CreateCheckBoxSpan(columnDefinition) {
        let newCheckBox = document.createElement("input");
        newCheckBox.id = columnDefinition.backingDataName + this.Index;
        newCheckBox.type = "checkbox";
        newCheckBox.checked = this.#backingData[columnDefinition.backingDataName];
        newCheckBox.style.cursor = "default";

        if (columnDefinition.updateHandler) {
            newCheckBox.addEventListener("change", () => {
                this.#UpdateBackingData();
                columnDefinition.updateHandler(this.#backingData);
            });
        }

        targetParent.className = "arrangeableListCheckbox " + targetParent.className;
        targetParent.appendChild(newCheckBox);
        return newCheckBox;
    }

    #CreateTextInputSpan(columnDefinition) {
        let newSpan = this.#renderRoot.querySelector(`[boundField="${columnDefinition.backingDataName}"]`);
        newSpan.contentEditable = true;
        newSpan.style.cursor = "text";
        newSpan.className = "arrangeableListTextInput " + newSpan.className;

        if (!columnDefinition.multiLine) {
            newSpan.addEventListener("keypress", (event) => {
                if (event.key == "Enter") {
                    event.preventDefault();
                    event.target.blur();
                }
            });
        }
        newSpan.id = columnDefinition.backingDataName + this.Index;
        newSpan.innerHTML = this.#backingData[columnDefinition.backingDataName];

        if (columnDefinition.updateHandler) {
            newSpan.addEventListener("focusout", () => {
                this.#UpdateBackingData();
                columnDefinition.updateHandler(this.#backingData);
            });
        }

        return newSpan;
    }

    #CreateRootNode() {
        let rootNode = document.createRange().createContextualFragment(this.#listDefinition.listItemHtml.trim()).firstChild;
        rootNode.id = "arrangeableListItem" + this.Index;
        rootNode.draggable = true;
        if (this.Index % 2 == 0) { rootNode.className += " arrangeableListItemAlt"; }
        this.#renderRoot = rootNode;

        rootNode.addEventListener("dragstart", (event) => {
            if ((document.activeElement == rootNode) || (document.activeElement.parentNode == rootNode)) {
                event.preventDefault();
                return true;
            }

            event.dataTransfer.setData("text", this.Index);
            event.dataTransfer.effectAllowed = "move";
        });

        return rootNode;
    }
    
    #UpdateAppearance() {
        if (this.#listDefinition.itemDrawHandler) {
            this.#listDefinition.itemDrawHandler(this.#renderRoot, this.#backingData);
        }
    }

    #UpdateBackingData() {
        for (let i = 0; i < this.#boundElements.length; i++) {
            let boundElement = this.#boundElements[i];
            let fieldName = boundElement.getAttribute("boundField");

            if ((boundElement.nodeName == "DIV") || (boundElement.nodeName == "SPAN")) {
                this.#backingData[fieldName] = boundElement.innerHTML;
            } else if ((boundElement.nodeName == "INPUT") && (boundElement.getAttribute("type") == "checkbox")) {
                this.#backingData[fieldName] = boundElement.checked;
            } else if ((boundElement.nodeName == "INPUT") && (boundElement.getAttribute("type") == "datetime-local")) {
                this.#backingData[fieldName] = boundElement.valueAsNumber;
            }
        }

        if (this.#listDefinition.itemUpdatedHandler) {
            this.#listDefinition.itemUpdatedHandler(this.#backingData);
        }

        this.#UpdateAppearance();
    }

}