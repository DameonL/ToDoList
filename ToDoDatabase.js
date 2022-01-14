class ToDoDatabase {
    #toDoItems = [];
    #reverseLookup = {};
    get count() { return this.#toDoItems.length; }

    GetToDoItems() {
        return [...this.#toDoItems];
    }

    GetToDoItem(index) {
        return toDoItems[index];
    }

    GetItemIndex(data) {
        return this.#toDoItems.indexOf(data);
    }

    AddToDoItem(data) {
        this.#toDoItems.push(data);
        this.#reverseLookup[data] = this.#toDoItems.length - 1;
        this.UpdateToDoItem(data);
    }

    DeleteItem(index, completeHandler) {
        let deletedItem = this.#toDoItems[index];
        this.#toDoItems.splice(index, 1);

        let dbOpenRequest = window.indexedDB.open("ToDoList", 1);
        dbOpenRequest.onsuccess = (event) => {
            let db = event.target.result;
            let transaction = db.transaction("ToDoItems", "readwrite");
            let store = transaction.objectStore("ToDoItems");
            let deleteRequest = store.delete(this.#toDoItems.length);

            transaction.oncomplete = () => {
                for (let i = index; i < this.#toDoItems.length; i++) {
                    this.UpdateToDoItem(this.#toDoItems[i]);
                }

                completeHandler();
            }
        }
    }

    UpdateToDoItem(data) {
        let dbOpenRequest = window.indexedDB.open("ToDoList", 1);
        dbOpenRequest.onsuccess = (event) => {
            let db = event.target.result;
            let transaction = db.transaction("ToDoItems", "readwrite");
            let store = transaction.objectStore("ToDoItems");
            let index = this.GetItemIndex(data);
            store.put(data, index);
        }
    }

    Initialize(onSuccess = null) {
        let dbOpenRequest = window.indexedDB.open("ToDoList", 1);
        dbOpenRequest.onupgradeneeded = this.#InitializeDatabase;
        dbOpenRequest.onsuccess = (event) => {
            let db = event.target.result;
            let transaction = db.transaction("ToDoItems", "readonly");
            let store = transaction.objectStore("ToDoItems");
        
            store.getAll().onsuccess = (event) => {
                this.#toDoItems = event.target.result;
                db.close();
                onSuccess();
            };

        }
    }

    #InitializeDatabase(event) {
        if (event.oldVersion == 0) {
            let db = event.target.result;
            let store = db.createObjectStore("ToDoItems", {
                autoIncrement: true
            });
    
            store.put({name: "My New ToDo Item", description: "Insert description here"}, 0);
        }
    }
}
