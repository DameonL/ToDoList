import { ToDoListItem } from "./ToDoListItem.js";
import { ToDoDatabase } from "./ToDoDatabase.js";

export class ToDoList {
    #database = null;
    #rootNode = null;
    #ignoreListChanges = false;

    constructor(rootNode) {
        this.#rootNode = rootNode;
        this.#database = new ToDoDatabase();
        this.#database.AddListChangedHandler((event) => {
            if (!this.#ignoreListChanges) this.RenderToDoListItems();
        });
}

    CreateListItem(data) {
        if (data == null) {
            data = { name: "New ToDo Item", description: "Insert description here" };
            this.#database.AddItem(data);
        }

        let newItem = new ToDoListItem(data, () => this.#database.GetItemIndex(data));
        newItem.AddChangeListener(this.#database.UpdateItem(data));

        return newItem;
    }

    DeleteItem(data) {
        this.#database.DeleteItem(data);
    }

    RenderToDoListItems() {
        while (this.#rootNode.firstChild) {
            this.#rootNode.removeChild(this.#rootNode.firstChild);
        }

        let itemData = this.#database.GetItems();

        for (let i = 0; i < itemData.length; i++) {
            let listItem = this.CreateListItem(itemData[i]);
            let renderer = listItem.Renderer;
            this.#rootNode.appendChild(renderer);
        }
    }
    
}
