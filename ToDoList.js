class ToDoList {
    #listItems = [];
    #database = new ToDoDatabase();
    #rootNode = null;

    constructor(rootNode) {
        this.#rootNode = rootNode;
        this.#database.Initialize(() => {
            let itemData = this.#database.GetToDoItems();
            let i = 0;
            itemData.forEach(data => {
                var newItem = new ToDoListItem(i, data);
                this.#listItems.push(newItem);
                var index = i;
                newItem.AddChangeListener(() => { this.#database.UpdateToDoItem(index); });
                i++;
            });

            this.RenderToDoListItems();
        });
    }

    AddNewItem() {
        let backingData = { name: "New ToDo Item", description: "Insert description here" };
        var index = this.#database.count;
        let newItem = new ToDoListItem(index, backingData);
        this.#listItems.push(newItem);
        this.#database.AddToDoItem(backingData);
        newItem.AddChangeListener(() => { this.#database.UpdateToDoItem(index); });
        this.RenderToDoListItems();
    }

    DeleteItem(index) {
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