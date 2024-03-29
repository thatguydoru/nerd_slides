class NerdSlideshow extends HTMLElement {
    static observedAttributes = ["height", "width", "start"];

    constructor() {
        super();
        this.slideListener = undefined;
        this.currentSlide = 1;
    }

    connectedCallback() {
        let shadow = this.attachShadow({ mode: "open" });
        shadow.innerHTML = `
            <style>
                .view {
                    display: block;
                    width: ${this.getAttribute("width")};
                    height: ${this.getAttribute("height")};
                    overflow: hidden;
                }
            </style>

            <div class="view">
                <slot><span>Add some slides nerd.</span></slot>
            </div>
        `;

        const start = this.getAttribute("start");
        this.slideTo(start ? Number(start) : 1);
        this.slideListener = this.handleKeyInput.bind(this);
        document.addEventListener("keydown", this.slideListener);
    }

    disconnectedCallback() {
        document.removeEventListener("keydown", this.slideListener);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (!this.shadowRoot) {
            return;
        }

        switch (name) {
            case "start":
                this.slideTo(newValue ? Number(newValue) : oldValue);
                break;

            case "width": case "height":
                let style = this.shadowRoot.querySelector("style");
                style.innerText = `
                    .view {
                        display: block;
                        width: ${this.getAttribute("width")};
                        height: ${this.getAttribute("height")};
                        overflow: hidden;
                    }
                `;
                break;
        }
    }

    handleKeyInput(event) {
        switch (event.key) {
            case "ArrowUp": case "ArrowLeft":
                this.currentSlide--;
                break;

            case "ArrowDown": case "ArrowRight":
                this.currentSlide++;
                break;
        }
        this.slide();
    }

    slide() {
        let view = this.shadowRoot.querySelector("div.view");
        this.currentSlide = clamp(this.currentSlide, 1, this.childElementCount);
        view.scroll({
            top: this.offsetHeight * (this.currentSlide - 1),
            behavior: "smooth"
        });
        this.dispatchEvent(new CustomEvent(
            "slide",
            { detail: this.currentSlide }
        ));
    }

    slideTo(slide) {
        this.currentSlide = slide;
        this.slide();
    }
}

class NerdSlide extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        let shadow = this.attachShadow({ mode: "open" });
        const slot = this.hasAttribute("title")
            ? `<slot></slot>`
            : `
                <header>
                    <slot name="header"></slot>
                </header>
                <slot name="body">
                    <span style="color: red;">Add some content, nerd</span>
                </slot>
                <footer>
                    <slot name="footer"></slot>
                </footer>
            `;
        const flow = this.getAttribute("flow") ?? "column";
        const gap = flow == "row" ? "32px" : "0";

        shadow.innerHTML = `
            <style>
                article {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-flow: ${flow} wrap;
                    gap: ${gap};
                    justify-content: center;
                    align-items: center;
                    background: inherit;
                    overflow: clip;
                }

                footer {
                    font-style: italic;
                }
            </style>

            <article>${slot}</article>
        `;
    }
}

function clamp(x, a, b) {
    const { max, min } = Math;
    return max(a, min(x, b));
}

customElements.define("nerd-slideshow", NerdSlideshow);
customElements.define("nerd-slide", NerdSlide);
