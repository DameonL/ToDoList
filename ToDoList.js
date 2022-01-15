import { ToDoListItem } from "./ToDoListItem.js";
import { ToDoDatabase } from "./ToDoDatabase.js";

export class ToDoList {
    #database = null;
    #rootNode = null;
    #ignoreListChanges = false;
    #itemData = [];

    constructor(rootNode) {
        this.#rootNode = rootNode;
        this.#database = new ToDoDatabase();
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
            console.log(data);
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
        emptyDiv.innerHTML = "&nbsp";
        emptyDiv.addEventListener("drop", (event) => {
            event.preventDefault();
            let droppedIndex = event.dataTransfer.getData("text");
            let targetIndex = emptyDiv.getAttribute("targetIndex");
            this.#database.InsertItemBefore(itemData[targetIndex], itemData[droppedIndex]);
        });

        emptyDiv.addEventListener("dragover", (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect="move";
        });

        emptyDiv.addEventListener("dragleave", (event) => {
            this.#rootNode.removeChild(emptyDiv);
        });

        for (let i = 0; i < itemData.length; i++) {

            let listItem = this.CreateListItem(itemData[i]);
            let renderer = listItem.Renderer;
            renderer.addEventListener("dragenter", (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect="move";
                if (event.movementY > 0) {
                    this.#rootNode.insertBefore(emptyDiv, renderer);
                    emptyDiv.setAttribute("targetIndex", listItem.Index);
                } else {
                    this.#rootNode.insertAfter(emptyDiv, renderer);
                    emptyDiv.setAttribute("targetIndex", listItem.Index + 1);
                }
                emptyDiv.setAttribute("targetIndex", listItem.Index);
            });

            this.#rootNode.appendChild(renderer);
        }

        this.#rootNode.parentNode.appendChild(buttonDiv);
    }

    
}
