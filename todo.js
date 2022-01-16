import { ToDoList } from "./ToDoList.js";

Start();

function Start() {
    if (!('indexedDB' in window)) {
        document.getRootNode().innerHTML = "Sorry, your browser does not support indexedDB";
        return;
    }

    let newItemHandler = () => { return { name: "New ToDo Item", description: "Insert description here", complete: false } };
    let toDoList = new ToDoList(newItemHandler);
    document.body.appendChild(toDoList.RootNode);
}

