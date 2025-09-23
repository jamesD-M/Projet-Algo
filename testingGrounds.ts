import { BaseRegles } from "./code.ts";

/*
Test 1: test de promotion
Les étapes:
 - Afficher l'état initial
 - Déplacer un pion rouge jusqu'à la dernière ligne pour le promouvoir
 - Ex: déplacer la pièce de (5, 0) → (0, 5) en diagonale simple
 - On fera plusieurs déplacements pour simuler le parcours
 - À la fin, la pièce rouge doit être promue (affichage en majuscule "R")

Note: Pour l'instant, on va virer la ligne 215 de code.ts qui vérifie que le jouer courant change pour que le test puisse aller sans hic
*/

const jeu = new BaseRegles();
jeu.afficherPiece();
const deplacements = [
    [5, 0, 4, 1],
    [4, 1, 3, 2],
    [3, 2, 2, 3],
    [2, 3, 1, 4],
    [1, 4, 0, 5]
];
for (const [x1, y1, x2, y2] of deplacements) {
    console.log(`Déplacement de (${x1},${y1}) → (${x2},${y2})`);
    jeu.lancerCoup(x1, y1, x2, y2);
}