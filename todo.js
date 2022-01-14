import { ItemDeleteDialog } from "./ItemDeleteDialog.js";
import { ToDoList } from "./ToDoList.js";

let toDoList = new ToDoList(document.getElementById("toDoListRender"));
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
        let droppedListIndex = Number(event.dataTransfer.getData("text/plain"));
        let deleteDialog = new ItemDeleteDialog(droppedListIndex, () => {
            toDoList.DeleteItem(droppedListIndex);
        });
    });
}

