import { ToDoListItem } from "./ToDoListItem.js";

export class ToDoList {
    #listItems = [];
    #database = null;
    #rootNode = null;

    constructor(rootNode) {
        this.#rootNode = rootNode;
        this.#database = new ToDoDatabase(() => {
            let itemData = this.#database.GetItems();
            itemData.forEach(data => {
                this.AddItem(data);
            });

            this.RenderToDoListItems();
        });
    }

    AddItem(data) {
        if (data == null) {
            data = { name: "New ToDo Item", description: "Insert description here" };
            this.#database.AddItem(data);
        }

        let newItem = new ToDoListItem(data, () => { return this.#database.GetItemIndex(data); });
        this.#listItems.push(newItem);
        newItem.AddChangeListener(() => this.#database.UpdateItem(data));
        this.RenderToDoListItems();
        return newItem;
    }

    DeleteItem(data) {
        let deletedItem = this.#listItems[index];
        this.#listItems.splice(index, 1);
        for (let i = index; i < this.#listItems.length; i++) {
            this.#listItems[i].Index -= 1;
            console.log(this.#listItems[i].Index);
        }

        this.#database.DeleteItem(index, () => {
            this.RenderToDoListItems();
        });
    }

    RenderToDoListItems() {
        while (this.#rootNode.firstChild) {
            this.#rootNode.removeChild(this.#rootNode.firstChild);
        }

        for (let i = 0; i < this.#listItems.length; i++) {
            let renderer = this.#listItems[i].Renderer;
            this.#rootNode.appendChild(renderer);
        }
    }
    
}
