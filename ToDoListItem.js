import { StyleSettings } from "./StyleSettings.js";

export class ToDoListItem {
    #indexFunction = null;
    #backingData = null;
    #onchange = [];
    #renderRoot = null;
    #elements = [];
    #columnDefinitions = [
        {
            label: "",
            width: "1.25em",
            backingDataName: "complete",
        },
        {
            label: "Name",
            width: "25%",
            backingDataName: "name",
        },
        {
            label: "Description",
            width: "65%",
            backingDataName: "description",
            multiLine: true,
        },
    ];
    
    get Index() { return this.#indexFunction(); }

    constructor(backingData, indexFunction) {
        this.#backingData = backingData;
        this.#indexFunction = indexFunction;
    }

    AddChangeListener(listener) {
        this.#onchange.push(listener);
    }

    RemoveChangeListener(listener) {
        let index = this.#onchange.indexOf(listener);
        if (index > -1) {
            this.#onchange.splice(index, 1);
        }
    }

    #ExecuteChangeHandlers() {
        for (let i = 0; i < this.#onchange.length; i++) {
            this.#onchange[i]();
        }
    }

    #UpdateAppearance() {
//        this.#elements.nameSpan.style.textDecoration = (this.#backingData.complete) ? "line-through" : "";
//        this.#elements.nameSpan.contentEditable = !this.#backingData.complete;
//        this.#elements.descriptionSpan.contentEditable = !this.#backingData.complete;
    }

    #UpdateBackingData() {
        for (let i = 0; i < this.#columnDefinitions.length; i++) {
            let columnData = this.#backingData[columnDefinition.backingDataName];
            let columnType = (typeof columnData);
            if (columnType == "text") {
                this.#backingData[this.#columnDefinitions[i].backingDataName] = this.#elements[i].innerHTML;
            } else if (columnType == "boolean") {
                this.#backingData[this.#columnDefinitions[i].backingDataName] = this.#elements[i].checked;
            }
        }
   }

    get Renderer() {
        if (this.#renderRoot == null) {
            let itemChanged = () => {
                this.#UpdateBackingData();
                this.#UpdateAppearance();
                this.#ExecuteChangeHandlers();
            }

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
                    columnInstance = this.#CreateTextInputSpan(columnDefinition, itemChanged);
                } else if (columnType == "boolean") {
                    columnInstance = this.#CreateCheckBoxSpan(columnDefinition, itemChanged);
                }

                this.#elements.push(columnInstance);
                rootNode.appendChild(columnInstance);
            });
            rootNode.style.gridTemplateColumns = columnTemplate;
        }

        return this.#renderRoot;
    }

    #CreateTextInputSpan(columnDefinition, changedHandler) {
        let newSpan = document.createElement("span");
        newSpan.contentEditable = true;
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
        newSpan.addEventListener("focusout", changedHandler);
        return newSpan;
    }

    #CreateCheckBoxSpan(columnDefinition, itemChanged) {
        let newCheckBox = document.createElement("input");
        newCheckBox.id = columnDefinition.backingDataName + this.Index;
        newCheckBox.type = "checkbox";
        newCheckBox.checked = this.#backingData[columnDefinition.backingDataName];
        newCheckBox.addEventListener("change", itemChanged);
        return newCheckBox;
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
        });
        return rootNode;
    }
}