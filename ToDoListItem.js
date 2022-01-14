class ToDoListItem {
    #index = -1;
    #backingData = null;
    #render = null;
    #onchange = [];

    constructor(index, backingData) {
        this.#index = index;
        this.#backingData = backingData;
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
        return this.#index;
    }

    set Index(newIndex) {
        this.#index = newIndex;
    }

    get Renderer() {
        if (this.#render == null) {
            let rootNode = document.createElement("div");
            rootNode.className = "toDoItem";
            let handleSpan = document.createElement("span");
            handleSpan.className = "toDoItemHandle";
            rootNode.draggable = true;
            rootNode.style.backgroundColor=(this.#index %2 == 0) ? StyleSettings.ListItemBGColor : StyleSettings.ListItemBGAltColor;
            rootNode.addEventListener("dragstart", (event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", this.#index);
            });

            let nameSpan = document.createElement("span");
            let descriptionSpan = document.createElement("span");
        
            nameSpan.contentEditable = true;
            nameSpan.className = "toDoItemName";
            nameSpan.id = "toDoItemName" + this.#index;
            nameSpan.innerHTML = this.#backingData.name;
            
            let itemChanged = () => {
                this.#backingData.name = document.getElementById("toDoItemName" + this.#index).innerHTML;
                this.#backingData.description = document.getElementById("toDoItemDescription" + this.#index).innerHTML;
                for (let i = 0; i < this.#onchange.length; i++) { this.#onchange[i](); }
            }
        
            descriptionSpan.contentEditable = true;
            descriptionSpan.className = "toDoItemDescription";
            descriptionSpan.id = "toDoItemDescription" + this.#index;
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