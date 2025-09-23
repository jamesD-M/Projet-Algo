import { BaseRegles, Plateau, Piece } from "./code.ts";

/*
Test 1: test de promotion
Les étapes :
 - Afficher le plateau initial avec le joueur courant
 - Déplacer un pion rouge jusqu'à la dernière ligne pour le promouvoir
 - Ex: déplacer la pièce de (5, 0) → (0, 5) en diagonale simple
 - Utiliser la fonction de test spéciale "special"
 - Faire plusieurs déplacements pour simuler le parcours
 - Vérifier qu'à la fin, la pièce rouge est promue (affichage en majuscule "R")
 - Les fonctions utilisent `diagonalx`, `diagonaly` et `absolute()` pour les calculs
 - Note : ignorez le changement automatique de `joueurCourant` pour ce test afin que la pièce puisse continuer son parcours sans interruption
*/


const jeu = new BaseRegles();
jeu.afficherPiece();
function special(jeu: BaseRegles, x1: number, y1: number, x2: number, y2: number) {
    const plateau: Plateau = (jeu as any).plateau;
    const piece: Piece | null = plateau.getPiece(x1, y1);
    if (!piece) return false;
    const diagonalx = x2 - x1;
    const diagonaly = y2 - y1;
    const abs = (jeu as any).absolute;
    if (abs(diagonalx) === 1 && abs(diagonaly) === 1) {
        plateau.deplacerPiece(x1, y1, x2, y2);
        return true;
    }
    if (abs(diagonalx) === 2 && abs(diagonaly) === 2) {
        const xm = x1 + diagonalx / 2;
        const ym = y1 + diagonaly / 2;
        plateau.supprimerPiece(xm, ym);
        plateau.deplacerPiece(x1, y1, x2, y2);
        return true;
    }

    return false;
}

//Test
const mouvement = [
    [5, 0, 4, 1],
    [4, 1, 3, 2],
    [3, 2, 2, 3],
    [2, 3, 1, 4],
    [1, 4, 0, 5]
];

for (const [x1, y1, x2, y2] of mouvement) {
    console.log(`Déplacement de (${x1},${y1}) → (${x2},${y2})`);
    special(jeu, x1, y1, x2, y2);
    jeu.afficherPiece();
}