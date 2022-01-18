export class ArrangeableListItem {
    #indexFunction = null;
    #backingData = null;
    #renderRoot = null;
    #elements = [];
    #columnDefinitions = null;
    #buttonDefinitions = null;

    get Index() { return this.#indexFunction(this.#backingData); }

    constructor(backingData, columnDefinitions, buttonDefinitions, indexFunction) {
        this.#backingData = backingData;
        this.#columnDefinitions = columnDefinitions;
        this.#indexFunction = indexFunction;
        this.#buttonDefinitions = buttonDefinitions;
    }

    get Renderer() {
        if (this.#renderRoot == null) {
            let rootNode = this.#CreateRootNode();
            this.#renderRoot = rootNode;

            let handleSpan = document.createElement("span");
            handleSpan.className = "listItemHandle";
            rootNode.appendChild(handleSpan);

            this.#columnDefinitions.forEach(columnDefinition => {
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
            buttonSpan.className = "listItemButtons";
            buttonSpan.style.fontSize = "18px";

            this.#buttonDefinitions.forEach(definition => {
                let button = document.createElement("span");
                button.innerHTML = definition.label;
                button.title = definition.tooltip;
                button.style.cursor = "pointer";
                button.addEventListener("click", (event) => { definition.clickedHandler(button, this.#backingData); });
                buttonSpan.appendChild(button);
            });

            rootNode.appendChild(buttonSpan);
        }

        return this.#renderRoot;
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
        let newSpan = document.createElement("span");

        newSpan.className = "listCheckbox";
        newSpan.appendChild(newCheckBox);
        return newSpan;
    }

    #CreateTextInputSpan(columnDefinition) {
        let newSpan = document.createElement("span");
        newSpan.contentEditable = true;
        newSpan.style.cursor = "text";
        newSpan.className = "listTextInput";

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
        let rootNode = document.createElement("div");
        rootNode.className = "listItem";
        rootNode.id = "toDoItem" + this.Index;
        rootNode.draggable = true;
        if (this.Index % 2 == 0) { rootNode.className += " altListItem"; }
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
            if (this.#columnDefinitions[i].drawHandler) {
                this.#columnDefinitions[i].drawHandler(this.#elements[i], this.#backingData);
            }
        }
    }

    #UpdateBackingData() {
        for (let i = 0; i < this.#columnDefinitions.length; i++) {
            let columnDefinition = this.#columnDefinitions[i];
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