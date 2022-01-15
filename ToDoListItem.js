import { StyleSettings } from "./StyleSettings.js";

export class ToDoListItem {
    #indexFunction = null;
    #backingData = null;
    #onchange = [];
    #elements = {
        root: null,
        completeCheck: null,
        nameSpan: null,
        descriptionSpan: null,        
    }
    
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
        nameSpan.style.textDecoration = (this.#backingData.complete) ? "line-through" : "";
    }

    #UpdateBackingData() {
        this.#backingData.name = this.#elements.nameSpan.innerHTML;
        this.#backingData.description = this.#elements.descriptionSpan.innerHTML;
        this.#backingData.complete = this.#elements.completeCheck.checked == true;
    }

    get Renderer() {
        if (this.#elements.root == null) {
            let itemChanged = () => {
                this.#UpdateBackingData();
                this.#UpdateAppearance();
                this.#ExecuteChangeHandlers();
            }

            let rootNode = document.createElement("div");
            rootNode.className = "toDoItem";
            rootNode.id = "toDoItem" + this.Index;
            rootNode.draggable = true;
            rootNode.style.backgroundColor = (this.Index % 2 == 0) ? StyleSettings.ListItemBGColor : StyleSettings.ListItemBGAltColor;
            this.#elements.root = rootNode;

            rootNode.addEventListener("dragstart", (event) => {
                if ((document.activeElement == rootNode) || (document.activeElement.parentNode == rootNode)) {
                    event.preventDefault();
                    return true;
                 }

                event.dataTransfer.setData("text", this.Index);
                event.dataTransfer.effectAllowed="move";
            });

            rootNode.addEventListener("dragover", (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect="move";
            });

            let completeCheck = document.createElement("input");
            completeCheck.id = "toDoItemComplete" + this.Index;
            completeCheck.type = "checkbox";
            completeCheck.checked = this.#backingData.complete;
            completeCheck.addEventListener("change", itemChanged);
            this.#elements.completeCheck = completeCheck;

            let handleSpan = document.createElement("span");
            handleSpan.className = "toDoItemHandle";

            let nameSpan = document.createElement("span");
            if (this.#backingData.complete) {
                nameSpan.style.textDecoration = "line-through";
            }
            nameSpan.contentEditable = true;
            nameSpan.className = "toDoItemName";
            nameSpan.id = "toDoItemName" + this.Index;
            nameSpan.innerHTML = this.#backingData.name;
            nameSpan.addEventListener("focusout", itemChanged);
            nameSpan.addEventListener("keypress", (event) => {
                if (event.key == "Enter") {
                    event.preventDefault();
                    event.target.blur();
                }
            });
            this.#elements.nameSpan = nameSpan;

            let descriptionSpan = document.createElement("span");
            descriptionSpan.contentEditable = true;
            descriptionSpan.className = "toDoItemDescription";
            descriptionSpan.id = "toDoItemDescription" + this.Index;
            descriptionSpan.innerHTML = this.#backingData.description;
            descriptionSpan.addEventListener("focusout", itemChanged);
            this.#elements.descriptionSpan = descriptionSpan;

            rootNode.appendChild(handleSpan);
            rootNode.appendChild(completeCheck);
            rootNode.appendChild(nameSpan);
            rootNode.appendChild(descriptionSpan);

            this.#elements.root = rootNode;
            this.#UpdateAppearance();
        }

        return this.#elements.root;
    }

}