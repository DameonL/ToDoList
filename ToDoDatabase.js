export class ToDoDatabase {
    #items = [];
    #reverseLookup = {};
    #itemChangedHandlers = [];

    get count() { return this.#items.length; }

    constructor(onSuccess = null) {
        let dbOpenRequest = window.indexedDB.open("ToDoList", 1);
        dbOpenRequest.onupgradeneeded = this.#InitializeDatabase;
        dbOpenRequest.onsuccess = (event) => {
            let db = event.target.result;
            let transaction = db.transaction("items", "readonly");
            let store = transaction.objectStore("items");
        
            store.getAll().onsuccess = (event) => {
                this.#items = event.target.result;
                db.close();
                if (onSuccess != null) { onSuccess(); }
            };

        }
    }

    AddItem(data) {
        this.#items.push(data);
        this.#reverseLookup[data] = this.#items.length - 1;
        this.UpdateItem(data);
    }

    DeleteItem(data, completeHandler) {
        let index = this.GetItemIndex(data);
        let deletedItem = this.#items[index];
        this.#items.splice(index, 1);

        let dbOpenRequest = window.indexedDB.open("ToDoList", 1);
        dbOpenRequest.onsuccess = (event) => {
            let db = event.target.result;
            let transaction = db.transaction("items", "readwrite");
            let store = transaction.objectStore("items");
            let deleteRequest = store.delete(this.#items.length);

            transaction.oncomplete = () => {
                for (let i = index; i < this.#items.length; i++) {
                    this.UpdateItem(this.#items[i]);
                }

                completeHandler();
            }
        }
    }

    GetItem(index) {
        return items[index];
    }

    GetItemIndex(data) {
        return this.#items.indexOf(data);
    }

    GetItems() {
        return [...this.#items];
    }

    UpdateItem(data) {
        let dbOpenRequest = window.indexedDB.open("ToDoList", 1);
        dbOpenRequest.onsuccess = (event) => {
            let db = event.target.result;
            let transaction = db.transaction("items", "readwrite");
            let store = transaction.objectStore("items");
            let index = this.GetItemIndex(data);
            store.put(data, index);
        }
    }

    #InitializeDatabase(event) {
        if (event.oldVersion == 0) {
            let db = event.target.result;
            let store = db.createObjectStore("items");
    
            store.put({name: "My New ToDo Item", description: "Insert description here"}, 0);
        }
    }
}
