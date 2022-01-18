export class ArrangeableListItem {
    #backingData = null;
    #renderRoot = null;
    #listDefinition = null;
    #elements = [];

    get Index() { return this.#indexFunction(this.#backingData); }

    constructor(backingData, listDefinition) {
        this.#backingData = backingData;
        this.#listDefinition = listDefinition;
    }

    get Renderer() {
        if (this.#renderRoot == null) {
            let rootNode = this.#CreateRootNode();
            this.#renderRoot = rootNode;

            let handleSpan = document.createElement("span");
            handleSpan.className = "arrangeableListItemHandle";
            rootNode.appendChild(handleSpan);

            this.#listDefinition.columnDefinitions.forEach(columnDefinition => {
                let columnData = this.#backingData[columnDefinition.backingDataName];
                let columnType = (typeof columnData);
                let columnInstance = null;

                if (columnType == "string") {
                    columnInstance = this.#CreateTextInputSpan(columnDefinition);
                } else if (columnType == "boolean") {
                    columnInstance = this.#CreateCheckBoxSpan(columnDefinition);
                }

                if (columnDefinition.className) columnInstance.className += " " + columnDefinition.className;

                this.#elements.push(columnInstance);
                rootNode.appendChild(columnInstance);
            });

            this.#UpdateAppearance();

            let buttonSpan = document.createElement("span");
            buttonSpan.className = "arrangeableListItemButtons";
            buttonSpan.style.fontSize = "18px";

            this.#listDefinition.buttonDefinitions.forEach(definition => {
                let button = document.createElement("span");
                button.innerHTML = definition.label;
                button.style.cursor = "pointer";
                button.addEventListener("click", (event) => { definition.clickedHandler(button, this.#backingData); });
                buttonSpan.appendChild(button);
            });

            rootNode.appendChild(buttonSpan);
        }

        return this.#renderRoot;
    }

    #CreateCheckBoxSpan(columnDefinition) {
        let targetParent = this.#renderRoot.querySelector(`[boundField="${columnDefinition.backingDataName}"]`);
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
        return targetParent;
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
        let rootNode = document.createRange().createContextualFragment(listDefinition.listItemHtml.trim()).firstChild;
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
            rootNode.style.cursor = "grabbing";
        });

        rootNode.addEventListener("dragend", (event) => {
            rootNode.style.cursor = "grab";
        });
        return rootNode;
    }
    
    #UpdateAppearance() {
        for (let i = 0; i < this.#elements.length; i++) {
            if (this.#listDefinition.columnDefinitions[i].drawHandler) {
                this.#listDefinition.columnDefinitions[i].drawHandler(this.#elements[i], this.#backingData);
            }
        }
    }

    #UpdateBackingData() {
        for (let i = 0; i < this.#listDefinition.columnDefinitions.length; i++) {
            let columnDefinition = this.#listDefinition.columnDefinitions[i];
            let element = this.#elements[i];
            let columnData = this.#backingData[columnDefinition.backingDataName];
            let columnType = (typeof columnData);

            if (columnType == "string") {
                this.#backingData[columnDefinition.backingDataName] = element.innerHTML;
            } else if (columnType == "boolean") {
                this.#backingData[columnDefinition.backingDataName] = element.firstChild.checked;
            }
        }

        this.#UpdateAppearance();
    }

}