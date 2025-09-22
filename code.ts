// Projet: Création du jeu de Dames
// 1. Création de classe: pièces
export class Piece {
    joueur: string; // "R" (rouge) ou "B" (bleu/noir)
    estDame: boolean;

    constructor(joueur: string, estDame: boolean = false) {
        this.joueur = joueur;
        this.estDame = estDame;
    }

    // Obtenir une représentation textuelle
    affichage(): string {
        if (this.estDame) {
            return this.joueur.toUpperCase(); // R ou B
        }
        return this.joueur.toLowerCase(); // r ou b
    }
}