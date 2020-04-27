"use strict";

/**
 *
 *  Class qui permet de gérer tous les dessins dans le canvas avec la gestion de plusieurs layers :
 *   - le background : chargement d'une image et du plateau qui ne change pas en cours de jeu
 *   - les layers : pour l'affichage du jeu avec des effacements selon les actions
 *   - le dernier layer : utilisé pour gérer l'icone personnalisé du curseur
 *   - le tooltipLayer : pour afficher une info bulle
 *
 *   Les interfaces de type mouseover et click sont chargés dans cette Class
 *   Ils permettent de détecter des collisions avec les formes définies et déclencher l'action souhaitée
 *
 *
 */

class Canvas {

    constructor(parentClass, nbOfLayer) {
        this.parentClass = parentClass;
        this.gameName = parentClass.gameName;
        this.canvasDivElement = document.getElementById("canvas_div");
        this.backgroundElement = document.getElementById("canvas_background");
        this.backgroundContext = this.backgroundElement.getContext("2d");
        this.tooltipElement = document.getElementById("canvas_tooltip");
        this.tooltipContext = this.tooltipElement.getContext("2d");
        this.layerElements = [];
        this.layerContexts = [];
        for (let i = 0; i < nbOfLayer; i++) {
            this.layerElements.push(document.getElementById("canvas_layer" + i));
            this.layerContexts.push(this.layerElements[i].getContext("2d"));
        }
        this.listOfForms = this.parentClass.drawBoard();
        this.zoom = 1;
        this.mousePosition = {x: null, y: null};
        this.drawCanvas();
        // On charge l'interface souris-canvas s'il elle existe
        if (typeof this.parentClass.loadInterface !== 'undefined') {
            this.listOfInterfaces = this.parentClass.loadInterface();
            this.loadEventListeners();
        }
    }

    drawCanvas() {
        let img = new Image();
        img.src = "images/" + this.gameName + "/background.webp";
        this.changeSizeWindow();
        img.onload = () => {
            this.backgroundContext.drawImage(img, 0, 0, 1440, 1600, 0, 0, BOARD_W * this.zoom, BOARD_H * this.zoom);
            this.drawListOfForms(this.backgroundContext, this.listOfForms);
        };
    }

    loadEventListeners() {
        // Gestion de la position de la souris pour la détection de collision avec des éléments interactifs
        this.tooltipElement.addEventListener("mousemove", (event) => {
            this.loadInterface(event, this, "mouseover");
        });
        this.tooltipElement.addEventListener("mousedown", (event) => {
            this.loadInterface(event, this, "click");
        });
    }

    loadInterface(event, self, triggerAction) {
        let canvasPosition = document.getElementById("canvas_tooltip").getBoundingClientRect();
        self.mousePosition = {
            x: Math.max(0, (event.clientX - canvasPosition.left) / self.zoom),
            y: Math.max(0, (event.clientY - canvasPosition.top) / self.zoom),
        };
        let action = self.testIfContactOnInterface(triggerAction);
        let nbOfAction = action.length;
        self.clearLayer(self.tooltipContext, self.tooltipElement);
        for (let i = 0; i < nbOfAction; i++) {
            self.listOfInterfaces[action[i].id].doAction(self.mousePosition);
            if (action[i].tooltip !== undefined) {
                self.drawTooltip(action[i].tooltip);
            }
        }
    }

    drawListOfForms(context, listOfForms) {
        for (let form of listOfForms) {
            if (form.type === "rectangle") {
                this.drawRectangle(context, form);
            } else if (form.type === "circle") {
                this.drawCircle(context, form);
            } else if (form.type === "polygon") {
                this.drawPolygon(context, form);
            } else if (form.type === "reverseCircle") {
                this.drawReverseCircle(context, form);
            } else if (form.type === "image") {
                this.drawImageCanvas(context, form);
            } else if (form.type === "path") {
                this.drawPathCanvas(context, form);
            }
        }
    }

    drawRectangle(context, options) {
        context.beginPath();
        context.rect(options.origin.x * this.zoom, options.origin.y * this.zoom, options.width * this.zoom, options.height * this.zoom);
        this.drawPen(context, options);
    }

    drawCircle(context, options) {
        context.beginPath();
        context.arc(options.origin.x * this.zoom, options.origin.y * this.zoom, options.radius * this.zoom, 0, 2 * Math.PI);
        this.drawPen(context, options);
    }

    drawPathCanvas(context, options) {
        context.beginPath();
        context.moveTo(options.origin.x * this.zoom, options.origin.y * this.zoom);
        context.lineTo(options.end.x * this.zoom, options.end.y * this.zoom);
        this.drawPen(context, options);
    }

    drawPolygon(context, options) {
        context.beginPath();
        context.moveTo(options.points[0].x * this.zoom, options.points[0].y * this.zoom);
        let length = options.points.length;
        for (let i = 1; i < length; i++) {
            context.lineTo(options.points[i].x * this.zoom, options.points[i].y * this.zoom);
        }
        context.closePath();
        this.drawPen(context, options);
    }

    drawReverseCircle(context, options) {
        context.beginPath();
        context.rect((options.origin.x) * this.zoom, options.origin.y * this.zoom, options.width * this.zoom, options.height * this.zoom);
        context.closePath();
        for (let hole of options.holes) {
            context.arc(hole.origin.x * this.zoom, hole.origin.y * this.zoom, hole.radius * this.zoom, 0, 2 * Math.PI, true);
            context.closePath();
        }
        this.drawPen(context, options);
    }

    drawImageCanvas(context, options) {
        context.drawImage(options.imageSrc, options.origin.x, options.origin.y, options.origin.width, options.origin.height,
            options.destination.x * this.zoom, options.destination.y * this.zoom, options.destination.width * this.zoom, options.destination.height * this.zoom);
    }

    drawText(context, options) {
        context.font = "12px 'Lucida Console'";
        context.fillStyle = "black";
        context.textAlign = "start";
        context.fillText(options.text, options.origin.x * this.zoom + 12 * this.zoom, options.origin.y * this.zoom + 17 * this.zoom);
    }

    drawPen(context, options) {
        context.save();
        if (options.shadow !== undefined) {
            context.shadowColor = options.shadow.shadowColor;
            context.shadowBlur = options.shadow.shadowBlur * this.zoom;
            context.shadowOffsetX = options.shadow.shadowOffsetX * this.zoom;
            context.shadowOffsetY = options.shadow.shadowOffsetY * this.zoom;
        }
        if (options.lineWidth !== undefined) {
            context.lineWidth = options.lineWidth * this.zoom;
        }
        if (options.stroke !== undefined) {
            context.strokeStyle = options.stroke;
            context.stroke();
        }
        if (options.fill !== undefined) {
            context.fillStyle = options.fill;
            context.fill();
        }
        context.restore();
    }

    clearLayer(context, canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    drawTooltip(text) {
        this.clearLayer(this.tooltipContext, this.tooltipElement);
        let rectangle = {
            type: "rectangle",
            origin: {x: this.mousePosition.x + 5 * this.zoom, y: this.mousePosition.y + 5 * this.zoom},
            width: text.length * 7.8 / this.zoom + 8 / this.zoom,
            height: 20 / this.zoom,
            stroke: "black",
            fill: "white",
        };
        let textToWrite = {
            type: "text",
            origin: this.mousePosition,
            text: text,
        };
        this.drawRectangle(this.tooltipContext, rectangle);
        this.drawText(this.tooltipContext, textToWrite);
    }

    changeZoom() {
        this.canvasDivElement.style.width = BOARD_W * this.zoom + "px";
        this.canvasDivElement.style.height = BOARD_H * this.zoom + "px";
        this.changeSizeCanvas(this.backgroundElement);
        this.changeSizeCanvas(this.tooltipElement);
        let nbOfLayer = this.layerElements.length;
        for (let i = 0; i < nbOfLayer; i++) {
            this.changeSizeCanvas(this.layerElements[i]);
        }
    }

    changeSizeCanvas(canvasElement) {
        canvasElement.width = BOARD_W * this.zoom;
        canvasElement.height = BOARD_H * this.zoom;
    }

    changeSizeWindow() {
        let zoomBefore = this.zoom;
        if (window.innerWidth >= 1068) {
            // version desktop
            if ((window.innerHeight - 120) * 0.95 < BOARD_H * this.zoom || (window.innerWidth) * 0.7 < BOARD_W * this.zoom) {
                // On réduit le zoom
                this.zoom = Math.min((window.innerHeight - 120) / BOARD_H * 0.95, window.innerWidth * 0.7 / BOARD_W);
            } else if ((window.innerHeight - 120) * 0.95 > BOARD_H * this.zoom || (window.innerWidth) * 0.7 > BOARD_W * this.zoom) {
                // On augment le zoom
                this.zoom = Math.min((window.innerHeight - 120) / BOARD_H * 0.95, window.innerWidth * 0.7 / BOARD_W);
            }
        } else {
            // version mobile
            if ((window.innerHeight - 80) * 0.7 < BOARD_H * this.zoom || (window.innerWidth) < BOARD_W * this.zoom) {
                // On réduit le zoom
                this.zoom = Math.min((window.innerHeight - 80) * 0.7 / BOARD_H, window.innerWidth / BOARD_W);
            } else if ((window.innerHeight - 80) * 0.7 > BOARD_H * this.zoom || (window.innerWidth) > BOARD_W * this.zoom) {
                // On augmente le zoom
                this.zoom = Math.min((window.innerHeight - 80) * 0.7 / BOARD_H, window.innerWidth / BOARD_W);
            }
        }
        if (zoomBefore !== this.zoom) {
            this.changeZoom();
        }
    }

    testIfContactOnInterface(triggerAction) {
        let length = this.listOfInterfaces.length;
        let actions = [];
        for (let i = 0; i < length; i++) {
            if (this.listOfInterfaces[i].triggerAction === triggerAction && this.testIfPointIsInsideForm(this.mousePosition, this.listOfInterfaces[i])) {
                actions.push(this.listOfInterfaces[i]);
            }
        }
        return actions;
    }

    testIfPointIsInsideForm(point, form) {
        if (form.type === "rectangle") {
            if (point.x >= form.origin.x && point.x <= form.origin.x + form.dimensionParameters.width &&
                point.y >= form.origin.y && point.y <= form.origin.y + form.dimensionParameters.height) {
                return true;
            }
        } else if (form.type === "circle") {
            if (this.calculateDistance(point, form.origin) <= form.dimensionParameters.radius) {
                return true;
            }
        }
        return false;
    }

    calculateDistance(point1, point2) {
        return (Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)));
    }
}