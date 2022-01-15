import { ItemDeleteDialog } from "./ItemDeleteDialog.js";
import { ToDoList } from "./ToDoList.js";

let newItemHandler = () => { return { name: "New ToDo Item", description: "Insert description here", complete: false } };
let toDoList = new ToDoList(newItemHandler);
let body = document.getElementsByClassName("body");
body.appendChild(toDoList.RootNode);
Start();

function Start() {
    if (!('indexedDB' in window)) {
        document.getRootNode().innerHTML = "Sorry, your browser does not support indexedDB";
        return;
    }

    let newItemButton = document.getElementById("newListItem");
    newItemButton.onclick = () => { toDoList.CreateNewItem(); }

    InitializeTrash();
}

function InitializeTrash() {
    let trashDiv = document.getElementById("trash");
    trashDiv.addEventListener("dragover", (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    });

    trashDiv.addEventListener("drop", (event) => {
        let droppedListIndex = Number(event.dataTransfer.getData("text"));
        let deleteDialog = new ItemDeleteDialog(droppedListIndex, () => {
            toDoList.DeleteItem(droppedListIndex);
        });
    });
}

