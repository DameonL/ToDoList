import { ArrangeableList } from "./ArrangeableList/ArrangeableList.js";
import { ItemDeleteDialog } from "./ItemDeleteDialog.js";
import { listDefinition, database } from "./ToDoListDefinition.js";

let toDoList = null;

Start();

function Start() {
    if (!('indexedDB' in window)) {
        document.getRootNode().innerHTML = "Sorry, your browser does not support indexedDB";
        return;
    }

    toDoList = new ArrangeableList(listDefinition);
    document.body.appendChild(toDoList.RootNode);

    let renderButton = document.createElement("button");
    renderButton.addEventListener("click", () => toDoList.Render());
    document.body.appendChild(renderButton);
}

