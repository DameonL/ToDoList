import { ToDoListItem } from "./ToDoListItem.js";
import { ToDoDatabase } from "./ToDoDatabase.js";
import { ItemDeleteDialog } from "./ItemDeleteDialog.js";

export class ToDoList {
    #database = null;
    #rootNode = null;
    #ignoreListChanges = false;
    #itemData = [];
    #createNewItem = null;
    #columnDefinitions = [
        {
            label: "",
            width: "1.25em",
            backingDataName: "complete",
        },
        {
            label: "Name",
            width: "25%",
            backingDataName: "name",
            drawHandler: (element, data) => { if (data.complete) element.style.textDecoration = "line-through"; },
        },
        {
            label: "Description",
            width: "50%",
            backingDataName: "description",
            multiLine: true,
        },
    ];


    constructor(newItemHandler) {
        this.#rootNode = document.createElement("div");
        this.#rootNode.id = "toDoListRender";

        this.#database = new ToDoDatabase("ToDoList", "items");
        this.#database.AddListChangedHandler((event) => {
            if (!this.#ignoreListChanges) this.RenderListItems();
        });
        this.#createNewItem = newItemHandler;
    }

    get RootNode() { return this.#rootNode; }

    CreateNewItem() {
        let data = this.#createNewItem();
        this.#database.AddItem(data);
        this.#database.InsertItemBefore(data, this.#itemData[0]);
    }

    CreateListItem(data) {
        let newItem = new ToDoListItem(
            data,
            this.#columnDefinitions,
            () => this.#database.GetItemIndex(data),
            () => { new ItemDeleteDialog(() => { this.DeleteItem(data); }); }
        );
        newItem.AddChangeListener(() => this.#database.UpdateItem(data));
        return newItem;
    }

    DeleteItem(data) {
        if (typeof data === "number") {
            data = this.#itemData[data];
        }

        this.#database.DeleteItem(data);
    }

    RenderListItems() {
        while (this.#rootNode.firstChild) {
            this.#rootNode.removeChild(this.#rootNode.firstChild);
        }

        let itemData = this.#database.GetItems();
        this.#itemData = itemData;

        let itemMovementDropPoint = this.#CreateMovementDiv(itemData);

        let labelDiv = this.#CreateLabelDiv();
        this.#rootNode.appendChild(labelDiv);

        let renderers = [];
        for (let i = 0; i < itemData.length; i++) {
            let renderer = this.#CreateChildItem(itemData, i, renderers, itemMovementDropPoint);
            this.#rootNode.appendChild(renderer);
        }

    }

    #CreateLabelDiv() {
        let labelDiv = document.createElement("div");
        labelDiv.className = "toDoItem";
        let columnTemplate = "1.25em ";
        labelDiv.appendChild(document.createElement("span"));
        this.#columnDefinitions.forEach(definition => {
            columnTemplate += definition.width + " ";
            let label = document.createElement("span");
            label.innerText = definition.label;
            labelDiv.appendChild(label);
        });
        columnTemplate += "auto";
        labelDiv.appendChild(document.createElement("span"));
        labelDiv.style.gridTemplateColumns = columnTemplate;
        return labelDiv;
    }

    #CreateChildItem(itemData, i, renderers, itemMovementDropPoint) {
        let listItem = this.CreateListItem(itemData[i]);
        let renderer = listItem.Renderer;
        renderers.push(renderer);
        let lastY = 0;
        let currentIndex = -1;
        let dragOverHandler = (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            let rect = renderer.getBoundingClientRect();
            let deadzone = 5;
            let delta = event.clientY - (rect.top + (rect.height * 0.5));
            if (Math.abs(delta) <= deadzone)
                return;

            let targetIndex = (delta < 0) ? i : i + 1;
            if (currentIndex != targetIndex) {
                itemMovementDropPoint.setAttribute("targetIndex", targetIndex);
                this.#rootNode.insertBefore(itemMovementDropPoint, renderers[targetIndex]);
                itemMovementDropPoint.animate(
                    [
                        { height: "0em" },
                        { height: "1.25em" }
                    ], {
                    fill: 'forwards',
                    duration: 100,
                    iterations: 1
                });
                currentIndex = targetIndex;
            }

            lastY = event.clientY;
        }

        renderer.addEventListener("dragover", dragOverHandler);

        renderer.addEventListener("dragend", (event) => {
            if (itemMovementDropPoint.parentNode == this.#rootNode) {
                this.#rootNode.removeChild(itemMovementDropPoint);
                currentIndex = -1;
            }
        });
        return renderer;
    }

    #CreateMovementDiv(itemData) {
        let itemMovementDropPoint = document.createElement("div");
        itemMovementDropPoint.className = "toDoItem";
        itemMovementDropPoint.style.border = "1px solid black";
        itemMovementDropPoint.addEventListener("drop", (event) => {
            event.preventDefault();
            let droppedIndex = event.dataTransfer.getData("text");
            let targetIndex = itemMovementDropPoint.getAttribute("targetIndex");
            this.#database.InsertItemBefore(itemData[droppedIndex], itemData[targetIndex]);
        });

        itemMovementDropPoint.addEventListener("dragover", (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
        });
        return itemMovementDropPoint;
    }
}
