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
        this.#database.InsertItemBefore(this.#itemData[0], data);
    }

    CreateListItem(data) {
        let newItem = new ToDoListItem(data, () => this.#database.GetItemIndex(data));
        newItem.AddChangeListener(() => this.#database.UpdateItem(data));

        return newItem;
    }

    get DeleteItem() { return this.#database.DeleteItem };

    RenderToDoListItems() {
        while (this.#rootNode.firstChild) {
            this.#rootNode.removeChild(this.#rootNode.firstChild);
        }

        let itemData = this.#database.GetItems();
        this.#itemData = itemData;

        for (let i = 0; i < itemData.length; i++) {
            let listItem = this.CreateListItem(itemData[i]);
            let renderer = listItem.Renderer;
            this.#rootNode.appendChild(renderer);
        }
    }
    
}
