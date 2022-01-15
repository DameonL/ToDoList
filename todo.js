import { ItemDeleteDialog } from "./ItemDeleteDialog.js";
import { ToDoList } from "./ToDoList.js";

let newItemHandler = () => { return { name: "New ToDo Item", description: "Insert description here", complete: false } };
let toDoList = new ToDoList(newItemHandler);
document.body.appendChild(toDoList.RootNode);
Start();

function Start() {
    if (!('indexedDB' in window)) {
        document.getRootNode().innerHTML = "Sorry, your browser does not support indexedDB";
        return;
    }

    let newItemButton = document.getElementById("newListItem");
    newItemButton.onclick = () => { toDoList.CreateNewItem(); }

}

