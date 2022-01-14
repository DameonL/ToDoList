import { StyleSettings } from "./StyleSettings.js";

export class ToDoListItem {
    #indexFunction = null;
    #backingData = null;
    #render = null;
    #onchange = [];

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

    get Renderer() {
        if (this.#render == null) {
            let itemChanged = () => {
                this.#backingData.name = document.getElementById("toDoItemName" + this.Index).innerHTML;
                this.#backingData.description = document.getElementById("toDoItemDescription" + this.Index).innerHTML;
                this.#backingData.complete = document.getElementById("toDoItemComplete" + this.Index).checked == true;
                this.#ExecuteChangeHandlers();
            }

            let rootNode = document.createElement("div");
            rootNode.className = "toDoItem";
            rootNode.id = "toDoItem" + this.Index;
            rootNode.draggable = true;
            rootNode.style.backgroundColor = (this.Index % 2 == 0) ? StyleSettings.ListItemBGColor : StyleSettings.ListItemBGAltColor;

            rootNode.addEventListener("dragstart", (event) => {
                event.dataTransfer.setData("text/plain", this.Index);
                event.dataTransfer.effectAllowed="move";
            });

            rootNode.addEventListener("dragover", (event) => {
                if (event.dataTransfer.getData("text/plain") == this.Index)
                    return;
                    
                event.preventDefault();
                event.dataTransfer.dropEffect="move";
            });

            let blankElement = document.createElement("div");
            blankElement.style.minHeight = 20;

            rootNode.addEventListener("drop", (event) => {
                if (event.dataTransfer.getData("text/plain") == this.Index)
                    return;

                event.preventDefault();

                console.log(event);
            });

            let completeCheck = document.createElement("input");
            completeCheck.id = "toDoItemComplete" + this.Index;
            completeCheck.type = "checkbox";
            completeCheck.checked = (this.#backingData.complete == true);
            completeCheck.addEventListener("change", itemChanged);

            let handleSpan = document.createElement("span");
            handleSpan.className = "toDoItemHandle";

            let nameSpan = document.createElement("span");
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

            let descriptionSpan = document.createElement("span");
            descriptionSpan.contentEditable = true;
            descriptionSpan.className = "toDoItemDescription";
            descriptionSpan.id = "toDoItemDescription" + this.Index;
            descriptionSpan.innerHTML = this.#backingData.description;
            descriptionSpan.addEventListener("focusout", itemChanged);

            rootNode.appendChild(handleSpan);
            rootNode.appendChild(completeCheck);
            rootNode.appendChild(nameSpan);
            rootNode.appendChild(descriptionSpan);

            this.#render = rootNode;
        }

        return this.#render;
    }

}