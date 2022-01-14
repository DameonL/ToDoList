class ToDoListItem {
    #indexFunction = null;
    #backingData = null;
    #render = null;
    #onchange = [];

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

    get Index() {
        return this.#indexFunction(this);
    }

    get Renderer() {
        if (this.#render == null) {
            let rootNode = document.createElement("div");
            rootNode.className = "toDoItem";
            let handleSpan = document.createElement("span");
            handleSpan.className = "toDoItemHandle";
            rootNode.draggable = true;
            rootNode.style.backgroundColor=(this.Index %2 == 0) ? StyleSettings.ListItemBGColor : StyleSettings.ListItemBGAltColor;
            rootNode.addEventListener("dragstart", (event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", this.Index);
            });

            let nameSpan = document.createElement("span");
            let descriptionSpan = document.createElement("span");
        
            nameSpan.contentEditable = true;
            nameSpan.className = "toDoItemName";
            nameSpan.id = "toDoItemName" + this.Index;
            nameSpan.innerHTML = this.#backingData.name;
            
            let itemChanged = () => {
                this.#backingData.name = document.getElementById("toDoItemName" + this.Index).innerHTML;
                this.#backingData.description = document.getElementById("toDoItemDescription" + this.Index).innerHTML;
                for (let i = 0; i < this.#onchange.length; i++) { this.#onchange[i](); }
            }
        
            descriptionSpan.contentEditable = true;
            descriptionSpan.className = "toDoItemDescription";
            descriptionSpan.id = "toDoItemDescription" + this.Index;
            descriptionSpan.innerHTML = this.#backingData.description;
        
            nameSpan.addEventListener("focusout", itemChanged);
            nameSpan.addEventListener("keypress", (event) => {
                if (event.key == "Enter") {
                    event.preventDefault();
                    event.target.blur();
                }
            });
            descriptionSpan.addEventListener("focusout", itemChanged);
        
            rootNode.appendChild(handleSpan);
            rootNode.appendChild(nameSpan);
            rootNode.appendChild(descriptionSpan);
    
            this.#render = rootNode;
        }

        return this.#render;
    }

}