import { ArrangeableList } from "./ArrangeableList/ArrangeableList.js";
import { ItemDeleteDialog } from "./ItemDeleteDialog.js";
import { listDefinition, database } from "./ToDoListDefinition.js";
    
let toDoList = null;
toDoList = new ArrangeableList(listDefinition);
document.body.appendChild(toDoList.RootNode);
setTimeout(() => {
    database.AddListChangedHandler((newList) => { toDoList.ItemData = newList; })
    toDoList.ItemData = database.Items;
}, 100);

let renderButton = document.createElement("button");
renderButton.addEventListener("click", () => toDoList.Render());
document.body.appendChild(renderButton);

function Start() {
    if (!('indexedDB' in window)) {
        document.getRootNode().innerHTML = "Sorry, your browser does not support indexedDB";
        return;
    }
}