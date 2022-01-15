import { ToDoListItem } from "./ToDoListItem.js";
import { ToDoDatabase } from "./ToDoDatabase.js";

export class ToDoList {
    #database = null;
    #rootNode = null;
    #ignoreListChanges = false;
    #itemData = [];

    constructor(rootNode) {
        this.#rootNode = rootNode;
        this.#database = new ToDoDatabase("ToDoList", "items");
        this.#database.AddListChangedHandler((event) => {
            if (!this.#ignoreListChanges) this.RenderToDoListItems();
        });
    }

    CreateNewItem() {
        let data = { name: "New ToDo Item", description: "Insert description here", complete: false };
        this.#database.AddItem(data);
        this.#database.InsertItemBefore(this.#itemData[0], data);
    }

    CreateListItem(data) {
        let newItem = new ToDoListItem(data, () => this.#database.GetItemIndex(data));
        newItem.AddChangeListener(() => this.#database.UpdateItem(data));

        return newItem;
    }

    DeleteItem(data) {
        if (typeof data === "number") {
            data = this.#itemData[data];
        }

        this.#database.DeleteItem(data); 
    }

    RenderToDoListItems() {
        while (this.#rootNode.firstChild) {
            this.#rootNode.removeChild(this.#rootNode.firstChild);
        }

        let itemData = this.#database.GetItems();
        this.#itemData = itemData;

        let emptyDiv = document.createElement("div");
        emptyDiv.className = "toDoItem";
        emptyDiv.addEventListener("drop", (event) => {
            event.preventDefault();
            let droppedIndex = event.dataTransfer.getData("text");
            let targetIndex = emptyDiv.getAttribute("targetIndex");
            console.log(`${droppedIndex} ${targetIndex}`);
            this.#database.InsertItemBefore(itemData[targetIndex], itemData[droppedIndex]);
        });

        emptyDiv.addEventListener("dragover", (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect="move";
        });

//        emptyDiv.addEventListener("dragleave", (event) => {
//            this.#rootNode.removeChild(emptyDiv);
//        });

//        emptyDiv.style.height = 0;

        let emptyDivAnimation = [
            { // from
                height: "0em",
            },
            { // to
                scale: "1.25em",
            }
          ];

        let renderers = [];
        for (let i = 0; i < itemData.length; i++) {

            let listItem = this.CreateListItem(itemData[i]);
            let renderer = listItem.Renderer;
            renderers.push(renderer);
            let lastY = 0;
            let currentIndex = -1;
            renderer.addEventListener("dragover", (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect="move";

                let delta = event.screenY - lastY;
                if (delta == 0) return;

                let targetIndex = (delta < 0) ? i : i + 1;
                if (delta < 0) {
                    this.#rootNode.insertBefore(emptyDiv, renderers[i]);
                    emptyDiv.setAttribute("targetIndex", listItem.Index);
                } else {
                    this.#rootNode.insertBefore(emptyDiv, renderers[i + 1]);
                    emptyDiv.setAttribute("targetIndex", listItem.Index + 1);
                }

                lastY = event.screenY;
            });

            renderer.addEventListener("dragend", (event) => { 
                if (emptyDiv.parentNode == this.#rootNode)
                {
                    this.#rootNode.removeChild(emptyDiv);
                    currentIndex = -1; 
                }
            });

            this.#rootNode.appendChild(renderer);
        }

    }

    
}

