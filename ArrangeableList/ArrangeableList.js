import { ArrangeableListItem } from "./ArrangeableListItem.js";

export class ArrangeableList {
    #rootNode = null;
    #itemData = [];
    #listDefinition = null;
    #sortColumn = "";
    #sortDirection = "asc";

    #listLabel = null;
    #listItems = [];
    #itemMovementDropPoint = null;

    constructor(listDefinition) {
        this.#listDefinition = listDefinition;
        let generatedFragment = document.createRange().createContextualFragment(listDefinition.listHtml.trim());
        let generatedDiv = generatedFragment.firstChild;
        document.body.appendChild(generatedDiv);
        this.#rootNode = generatedDiv;
    }

    get RootNode() { return this.#rootNode; }

    set ItemData(data) {
        this.#itemData = data;
        this.#itemMovementDropPoint = null;
        this.Render();
    }

    get SortColumn() { return this.#sortColumn; }
    set SortColumn(newColumn) { this.#sortColumn = newColumn; }

    CreateListItem(data) {
        let newItem = new ArrangeableListItem(data, this.#listDefinition);
        return newItem;
    }

    IndexOf = (data) => this.#listDefinition.itemIndexHandler(data);

    Render() {
        this.#listItems.forEach(item => {
            this.#rootNode.removeChild(item.renderer);
        });
        if (this.#listLabel) this.#rootNode.removeChild(this.#listLabel);
        if (this.#itemMovementDropPoint) this.#rootNode.removeChild(this.#itemMovementDropPoint);

        this.#listItems = [];

        if (this.#sortColumn != "") {
            this.#itemData.sort((a, b) => {
                let comparison = 0;
                a = a[this.#sortColumn];
                b = b[this.#sortColumn];


                if ((typeof a) == "string")
                {
                    comparison = a.localeCompare(b);
                } else {
                    if (a < b) comparison = -1;
                    else if (a > b) comparison = 1;
                }

                if (this.#sortDirection != "asc") comparison = (comparison > 0) ? -comparison :  Math.abs(comparison);

                return comparison;
            });
        }
        else {
            this.#itemData.sort((a, b) => {
                a = this.IndexOf(a);
                b = this.IndexOf(b);
                let comparison = 0;
                if (a < b) comparison = -1;
                else if (a > b) comparison = 1;
                return comparison;
            });
        }

        let itemData = this.#itemData;
        this.#listLabel = this.#CreateLabelDiv();
        this.#rootNode.appendChild(this.#listLabel);

        if (this.#itemMovementDropPoint == null) {
            this.#itemMovementDropPoint = this.#CreateMovementDiv(itemData);
        }
        
        for (let i = 0; i < itemData.length; i++) {
            let listItem = this.#CreateChildItem(itemData[i], this.#itemMovementDropPoint);
            let renderer = listItem.Renderer;
            if (this.#listDefinition.itemDrawHandler) {
                this.#listDefinition.itemDrawHandler(renderer, itemData[i]);
            }
            
            this.#listItems.push(listItem);
            this.#rootNode.appendChild(renderer);
        }
    }

    #CreateLabelDiv() {
        let generatedFragment = document.createRange().createContextualFragment(this.#listDefinition.labelHtml.trim());
        let labelDiv = generatedFragment.firstChild;

        let boundElements = labelDiv.querySelectorAll(`[boundField]`);
        boundElements.forEach(element => {
            let sortColumn = element.getAttribute("boundField");

            let clickedHandler = (event) => {
                if (this.#sortColumn == sortColumn) {
                        if (this.#sortDirection == "desc") { sortColumn = ""; }
                        this.#sortDirection = (this.#sortDirection == "asc") ? "desc" : "asc";   
                    }
    
                this.#sortColumn = sortColumn;
                this.Render();
            }
        
            clickedHandler = clickedHandler.bind(this);
            if (sortColumn == this.#sortColumn) {
                element.innerText += (this.#sortDirection == "asc") ? "⬇" : "⬆";
            }

            element.addEventListener("click", clickedHandler);
        });

        return labelDiv;
    }

    #CreateChildItem(itemData, itemMovementDropPoint) {
        let listItem = this.CreateListItem(itemData);
        let renderer = listItem.Renderer;
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
                this.#rootNode.insertBefore(itemMovementDropPoint, this.#listItems[targetIndex].renderer);
                // Trigger animations
                itemMovementDropPoint.className = itemMovementDropPoint.className.replace("arrangeableItemMovementTarget", "");
                itemMovementDropPoint.className += " arrangeableItemMovementTarget";
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
        return listItem;
    }

    #CreateMovementDiv(itemData) {
        let itemMovementDropPoint = document.createRange().createContextualFragment(this.#listDefinition.itemMovementTargetHtml.trim()).firstChild;
        itemMovementDropPoint.addEventListener("drop", (event) => {
            event.preventDefault();
            let droppedIndex = event.dataTransfer.getData("text");
            let targetIndex = itemMovementDropPoint.getAttribute("targetIndex");
            this.#listDefinition.itemInsertHandler(itemData[droppedIndex], itemData[targetIndex]);
        });

        itemMovementDropPoint.addEventListener("dragover", (event) => {
            event.preventDefault();
        });
        return itemMovementDropPoint;
    }
}
