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
            this.#backingData[this.#columnDefinitions[i].backingDataName] = this.#elements[i].innerHTML;
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

            let handleSpan = document.createElement("span");
            handleSpan.className = "listItemHandle";

            let completeCheck = this.#CreateCompleteCheckBox(itemChanged);
            this.#elements.push(completeCheck);

            let nameSpan = this.#CreateTextInputSpan(this.#columnDefinitions[1], itemChanged);
            this.#elements.push(nameSpan);

            let descriptionSpan = this.#CreateDescriptionSpan(itemChanged);
            this.#elements.push(descriptionSpan);

            rootNode.appendChild(handleSpan);
            rootNode.appendChild(completeCheck);
            rootNode.appendChild(nameSpan);
            rootNode.appendChild(descriptionSpan);

            this.#renderRoot = rootNode;
            this.#UpdateAppearance();
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


    #CreateDescriptionSpan(itemChanged) {
        let descriptionSpan = document.createElement("span");
        descriptionSpan.contentEditable = true;
        descriptionSpan.className = "toDoItemDescription";
        descriptionSpan.id = "toDoItemDescription" + this.Index;
        descriptionSpan.innerHTML = this.#backingData.description;
        descriptionSpan.addEventListener("focusout", itemChanged);
        return descriptionSpan;
    }

    #CreateNameSpan(itemChanged) {
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
        return nameSpan;
    }

    #CreateCompleteCheckBox(itemChanged) {
        let completeCheck = document.createElement("input");
        completeCheck.id = "toDoItemComplete" + this.Index;
        completeCheck.type = "checkbox";
        completeCheck.checked = this.#backingData.complete;
        completeCheck.addEventListener("change", itemChanged);
        return completeCheck;
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