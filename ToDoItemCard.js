export class ToDoItemCard {
    #backingData = null;
    #cardHtml = `
    <div boundField="name"></div>
    `;

    constructor(backingData) {
        this.#backingData = backingData;
    }

    Render() {
        let documentHider = document.createElement("div");
        documentHider.className = "itemDeleteDialog";
        let newNode = document.createElement("div");
        documentHider.appendChild(newNode);
        newNode.className = "itemDeleteDialogCenter";
        newNode.innerHTML = this.#cardHtml;
        let propertyNames = Object.keys(this.#backingData);
        propertyNames.forEach(property => {
            let boundField = document.querySelector(`boundField="${property}"`);
            if (boundField) {
                boundField.innerHTML = this.#backingData[property];
            }
        });
        document.body.appendChild(documentHider);
    }
}