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
// CLASSE : Plateau
export class Plateau {
    private grille: (Piece | null)[][];
    private taille: number = 8;

    constructor() {
        this.grille = [];
        this.initialiser();
    }

    // Initialiser le plateau avec les pièces
    private initialiser(): void {
        this.grille = [];
        for (let i = 0; i < this.taille; i++) {
            this.grille[i] = [];
            for (let j = 0; j < this.taille; j++) {
                this.grille[i][j] = null;
            }
        }

        // Placer les pièces noires (en haut)
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < this.taille; j++) {
                if ((i + j) % 2 === 1) {
                    this.grille[i][j] = new Piece("N"); // joueur noir
                }
            }
        }

        // Placer les pièces rouges (en bas)
        for (let i = this.taille - 3; i < this.taille; i++) {
            for (let j = 0; j < this.taille; j++) {
                if ((i + j) % 2 === 1) {
                    this.grille[i][j] = new Piece("R"); // joueur rouge
                }
            }
        }
    }

    // Afficher le plateau
    afficher(): void {
        console.log("  0 1 2 3 4 5 6 7");
        for (let i = 0; i < this.taille; i++) {
            let ligne = i + " ";
            for (let j = 0; j < this.taille; j++) {
                const casePlateau = this.grille[i][j];
                ligne += (casePlateau ? casePlateau.affichage() : ".") + " ";
            }
            console.log(ligne);
        }
    }

    // Vérifier si une position est valide
    estValide(x: number, y: number): boolean {
        return x >= 0 && x < this.taille && y >= 0 && y < this.taille;
    }

    // Obtenir une pièce
    getPiece(x: number, y: number): Piece | null {
        if (!this.estValide(x, y)) return null;
        return this.grille[x][y];
    }

    // Déplacer une pièce (sans vérifier la légalité pour l’instant)
    deplacerPiece(x1: number, y1: number, x2: number, y2: number): boolean {
        if (!this.estValide(x1, y1) || !this.estValide(x2, y2)) {
            return false;
        }
        const piece = this.grille[x1][y1];
        if (!piece) return false;

        this.grille[x2][y2] = piece;
        this.grille[x1][y1] = null;

        // Promotion si arrivée au bout
        if ((piece.joueur === "R" && x2 === 0) || (piece.joueur === "N" && x2 === this.taille - 1)) {
            piece.estDame = true;
        }

        return true;
    }
}