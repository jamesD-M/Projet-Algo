"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var code_1 = require("./code");
/*
Test 1: test de promotion

 - Afficher l'état initial
 - Déplacer un pion rouge jusqu'à la dernière ligne pour le promouvoir
 - Exemple : déplacer la pièce de (5, 0) → (0, 5) en diagonale simple
 - On fera plusieurs déplacements simples pour simuler le parcours
 - À la fin, la pièce rouge doit être promue (affichage en majuscule "R")
- Pour l'instant, on va virer la ligne 215 de code.ts pour que le test puisse aller sans soucis
*/
var jeu = new code_1.BaseRegles();
jeu.afficherPiece();
var déplacements = [
    [5, 0, 4, 1],
    [4, 1, 3, 2],
    [3, 2, 2, 3],
    [2, 3, 1, 4],
    [1, 4, 0, 5]
];
for (var _i = 0, déplacements_1 = déplacements; _i < déplacements_1.length; _i++) {
    var _a = déplacements_1[_i], x1 = _a[0], y1 = _a[1], x2 = _a[2], y2 = _a[3];
    console.log("D\u00E9placement de (".concat(x1, ",").concat(y1, ") \u2192 (").concat(x2, ",").concat(y2, ")"));
    jeu.lancerCoup(x1, y1, x2, y2);
}
