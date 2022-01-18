import { ArrangeableListItem } from "./ArrangeableListItem.js";

export class ArrangeableList {
    #rootNode = null;
    #itemData = [];
    #listDefinition = null;
    #itemMovementDropPoint = null;

    constructor(listDefinition) {
        this.#listDefinition = listDefinition;
        let generatedFragment = document.createRange().createContextualFragment(listDefinition.listHtml.trim());
        let generatedDiv = generatedFragment.firstChild;
        generatedDiv.id = listDefinition.listId;
        document.body.appendChild(generatedDiv);
        this.#rootNode = generatedDiv;
    }

    get RootNode() { return this.#rootNode; }

    set ItemData(data) {
        this.#itemData = data;
        this.#itemMovementDropPoint = null;
        this.Render();
    }

    CreateListItem(data) {
        let newItem = new ArrangeableListItem(
            data,
            this.#listDefinition.columnDefinitions,
            this.#listDefinition.itemButtonDefinitions,
            this.#listDefinition.itemIndexHandler
        );
        return newItem;
    }

    Render() {
        while (this.#rootNode.firstChild) {
            this.#rootNode.removeChild(this.#rootNode.firstChild);
        }

        let itemData = this.#itemData;
        let labelDiv = this.#CreateLabelDiv();
        this.#rootNode.appendChild(labelDiv);

        if (this.#itemMovementDropPoint == null) {
            this.#itemMovementDropPoint = this.#CreateMovementDiv(itemData);
        }
        
        let renderers = [];
        for (let i = 0; i < itemData.length; i++) {
            let renderer = this.#CreateChildItem(itemData, i, renderers, this.#itemMovementDropPoint);
            this.#rootNode.appendChild(renderer);
        }
    }

    #CreateLabelDiv() {
        let labelDiv = document.createElement("div");
        labelDiv.className = "arrangeableListItem arrangeableListLabel";
        labelDiv.style.cursor = "default";

        let handleSpan = document.createElement("span");
        handleSpan.className = "arrangeableListItemHandle arrangeableListLabelHandle";
        labelDiv.appendChild(handleSpan);

        this.#listDefinition.columnDefinitions.forEach(definition => {
            let labelText = 
                (definition.label == undefined) 
                ? definition.backingDataName[0].toUpperCase() + definition.backingDataName.substring(1) 
                : definition.label;
            
            let label = document.createElement("span");
            label.innerHTML = labelText;
            if (definition.className) label.className += " " + definition.className;

            labelDiv.appendChild(label);
        });

        let buttonSpan = document.createElement("span");
        buttonSpan.className = "arrangeableListItemButtons arrangeableListLabelButtons";
        buttonSpan.style.fontSize = "18px";

        this.#listDefinition.labelButtonDefinitions.forEach(definition => {
            let button = document.createElement("span");
            button.innerHTML = definition.label;
            button.style.cursor = "pointer";
            button.addEventListener("click", definition.clickedHandler);
            buttonSpan.appendChild(button);
        });

        labelDiv.appendChild(buttonSpan);

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
        return renderer;
    }

    #CreateMovementDiv(itemData) {
        let itemMovementDropPoint = document.createRange().createContextualFragment(this.#listDefinition.itemMovementTargetHtml.trim()).firstChild;
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
