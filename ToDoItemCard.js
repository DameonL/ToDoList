export class ToDoItemCard {
    #backingData = null;
    #documentHider = `<div class="documentHider"></div>`;
    #cardHtml = `
    <div class="cardBackground">
        <div>
            <input type="checkbox" boundField="complete"><span boundField="name"></span>
        </div>
        <div boundfield="description"></div>
    </div>
    `;

    constructor(backingData) {
        this.#backingData = backingData;
    }

    Render() {
        let documentHider = document.createRange().createContextualFragment(this.#documentHider.trim()).firstChild;
        let cardNode = document.createRange().createContextualFragment(this.#cardHtml.trim()).firstChild;
        
        document.body.appendChild(documentHider);
        document.body.appendChild(cardNode);

        cardNode.addEventListener("click", (event) => {
            cardNode.parentNode.removeChild(documentHider);
            cardNode.parentNode.removeChild(cardNode);
        });

        let propertyNames = Object.keys(this.#backingData);
        propertyNames.forEach(property => {
            let boundField = document.querySelector(`[boundField="${property}"]`);
            if (boundField) {
                if ((boundField.nodeName == "DIV") || (boundField.nodeName == "SPAN")) {
                    boundField.innerHTML = this.#backingData[property];
                }
                else if ((boundField.nodeName == "INPUT") && (boundField.getAttribute("type") == "checkbox")) {
                    boundField.checked = this.#backingData[property];
                }
            }
        });
    }
}