import { ListItem } from "./ListItem.js";

export class ArrangeableList {
    #rootNode = null;
    #itemData = [];
    #CreateNewItem = null;
    #InsertItem = null;
    #itemIndexHandler = null;
    #columnDefinitions = [];
    #itemButtonDefinitions = [];
    #itemMovementTargetHtml = `<div class="itemMovementTarget"></div>`;
    #itemMovementAppearAnimation = [[
        { height: "0em" },
        { height: "1.25em" }
    ],
    {
        fill: 'forwards',
        duration: 100,
        iterations: 1
    }];


    set ItemMovementTargetHtml(newHTML) {
        this.#itemMovementTargetHtml = newHTML;
        this.Render();
    }

    get ItemMovementTargetHtml() {
        return this.#itemMovementTargetHtml;
    }

    constructor(newItemHandler, insertHandler, itemIndexHandler, columnDefinitions, itemButtonDefinitions) {
        this.#columnDefinitions = columnDefinitions;
        this.#itemButtonDefinitions = itemButtonDefinitions;

        this.#rootNode = document.createElement("div");
        this.#rootNode.id = "ArrangeableListRender";
        this.#CreateNewItem = newItemHandler;
        this.#InsertItem = insertHandler;
        this.#itemIndexHandler = itemIndexHandler;
    }

    get RootNode() { return this.#rootNode; }

    set ItemData(data) {
        this.#itemData = data;
        this.Render();
    }

    CreateListItem(data) {
        let newItem = new ListItem(
            data,
            this.#columnDefinitions,
            this.#itemButtonDefinitions,
            this.#itemIndexHandler
        );
        return newItem;
    }

    Render() {
        while (this.#rootNode.firstChild) {
            this.#rootNode.removeChild(this.#rootNode.firstChild);
        }

        let itemData = this.#itemData;
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
        labelDiv.style.cursor = "default";

        let columnTemplate = "1.25em ";
        let newItemButton = document.createElement("span");
        newItemButton.innerText = "+";
        newItemButton.title = "Create a new item";
        newItemButton.style.cursor = "pointer";
        newItemButton.addEventListener("click", () => this.#CreateNewItem());

        labelDiv.appendChild(newItemButton);

        this.#columnDefinitions.forEach(definition => {
            let labelText = 
                (definition.label == undefined) 
                ? definition.backingDataName[0].toUpperCase() + definition.backingDataName.substring(1) 
                : definition.label;
            
            let label = document.createElement("span");
            label.innerHTML = labelText;
            if (definition.className) label.className += " " + definition.className;

            labelDiv.appendChild(label);
        });

        labelDiv.appendChild(document.createElement("span"));

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
            let rect = renderer.getBoundingClientRect();
            let deadzone = 5;
            let delta = event.clientY - (rect.top + (rect.height * 0.5));
            if (Math.abs(delta) <= deadzone)
                return;

            let targetIndex = (delta < 0) ? i : i + 1;
            if (currentIndex != targetIndex) {
                itemMovementDropPoint.setAttribute("targetIndex", targetIndex);
                this.#rootNode.insertBefore(itemMovementDropPoint, renderers[targetIndex]);
                itemMovementDropPoint.animate(this.#itemMovementAppearAnimation[0], this.#itemMovementAppearAnimation[1]);
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
        let itemMovementDropPoint = document.createRange().createContextualFragment(this.#itemMovementTargetHtml.trim()).firstChild;
        itemMovementDropPoint.addEventListener("drop", (event) => {
            event.preventDefault();
            let droppedIndex = event.dataTransfer.getData("text");
            let targetIndex = itemMovementDropPoint.getAttribute("targetIndex");
            this.#InsertItem(itemData[droppedIndex], itemData[targetIndex]);
        });

        itemMovementDropPoint.addEventListener("dragover", (event) => {
            event.preventDefault();
        });
        return itemMovementDropPoint;
    }
}
