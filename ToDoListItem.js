import { StyleSettings } from "./StyleSettings.js";

export class ToDoListItem {
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

            if (columnType == "text") {
                this.#backingData[columnDefinition.backingDataName] = element.innerHTML;
            } else if (columnType == "boolean") {
                this.#backingData[columnDefinition.backingDataName] = element.firstChild.checked;
            }
        }

        this.#UpdateAppearance();
   }

    get Renderer() {
        if (this.#renderRoot == null) {

            let rootNode = this.#CreateRootNode();
            this.#renderRoot = rootNode;

            let handleSpan = document.createElement("span");
            handleSpan.className = "listItemHandle";
            rootNode.appendChild(handleSpan);

            let columnTemplate = "1.25em ";
            this.#columnDefinitions.forEach(columnDefinition => {
                columnTemplate += columnDefinition.width + " ";
                let columnData = this.#backingData[columnDefinition.backingDataName];
                let columnType = (typeof columnData);
                let columnInstance = null;
                if (columnType == "string") {
                    columnInstance = this.#CreateTextInputSpan(columnDefinition);
                } else if (columnType == "boolean") {
                    columnInstance = this.#CreateCheckBoxSpan(columnDefinition);
                }

                this.#elements.push(columnInstance);
                rootNode.appendChild(columnInstance);
            });

            this.#UpdateAppearance();
            columnTemplate += " auto";
            
            let buttonSpan = document.createElement("span");
            buttonSpan.style.fontSize = "18px";
            buttonSpan.style.marginLeft = "auto";
            buttonSpan.style.marginRight = 0;

            this.#buttonDefinitions.forEach(definition => {
                let button = document.createElement("span");
                button.innerText = definition.label;
                button.title = definition.tooltip;
                button.style.cursor = "pointer";
                button.addEventListener("click", (event) => { definition.clickedHandler(button, this.#backingData); });
                buttonSpan.appendChild(button);
            });
            
            rootNode.appendChild(buttonSpan);
            rootNode.style.gridTemplateColumns = columnTemplate;
        }

        return this.#renderRoot;
    }

    #CreateTextInputSpan(columnDefinition) {
        let newSpan = document.createElement("span");
        newSpan.contentEditable = true;
        newSpan.style.cursor = "text"
        if (!this.#backingData.multiLine) {
            newSpan.addEventListener("keypress", (event) => {
                if (event.key == "Enter") {
                    event.preventDefault();
                    event.target.blur();
                }
            });
        }
        newSpan.id = columnDefinition.backingDataName + this.Index;
        newSpan.innerHTML = this.#backingData[columnDefinition.backingDataName];
        if (columnDefinition.updateHandler) newSpan.addEventListener("focusout", () => {
            columnDefinition.updateHandler(this.#backingData);
            this.#UpdateBackingData();
        });

        return newSpan;
    }

    #CreateCheckBoxSpan(columnDefinition) {
        let newCheckBox = document.createElement("input");
        newCheckBox.id = columnDefinition.backingDataName + this.Index;
        newCheckBox.type = "checkbox";
        newCheckBox.checked = this.#backingData[columnDefinition.backingDataName];
        newCheckBox.style.cursor = "default"
        if (columnDefinition.updateHandler) newCheckBox.addEventListener("change", () => {
            columnDefinition.updateHandler(this.#backingData);
            this.#UpdateBackingData();
        });
        
        let newSpan = document.createElement("span");
        newSpan.appendChild(newCheckBox);
        return newSpan;
    }

    #CreateRootNode() {
        let rootNode = document.createElement("div");
        rootNode.className = "toDoItem";
        rootNode.id = "toDoItem" + this.Index;
        rootNode.draggable = true;
        rootNode.style.backgroundColor = (this.Index % 2 == 0) ? StyleSettings.ListItemBGColor : StyleSettings.ListItemBGAltColor;
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
}