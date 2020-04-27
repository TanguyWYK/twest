"use strict";

/**
 *
 *  Class qui permet de charger les actions avec le constructor de la Class Canvas
 *
 *  Attention les id des interfaces doivent correspondent à la clé du tableau listOfInterface lors de la déclaration du tableau
 *  dans les Classes des jeux
 *
 */

class Interface {

    constructor(parentClass, action, options) {
        this.id = options.id;
        this.type = options.type;
        this.origin = options.origin;
        this.dimensionParameters = options.dimensionParameters;
        this.tooltip = options.tooltip;
        this.triggerAction = options.triggerAction;
        this.action = action;
        this.parentClass = parentClass;
    }

    doAction(mousePosition) {
        this.action(this.parentClass, mousePosition, this.id);
    }
}