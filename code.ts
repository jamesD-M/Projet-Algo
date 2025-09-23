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

    // Déplacer une pièce
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

    // Supprime une pièce à la position donnée
    supprimerPiece(x: number, y: number): void {
        if (this.estValide(x, y)) {
            this.grille[x][y] = null;
        }
    }
}

export class JeuDeDames {
    private plateau: Plateau;
    private joueurCourant: string;

    constructor() {
        this.plateau = new Plateau();
        // le rouge commence
        this.joueurCourant = "R";
    }

    // Afficher le plateau avec le joueur courant
    afficherPiece(): void {
        console.log(`Tour du joueur : ${this.joueurCourant}`);
        this.plateau.afficher();
    }

    // Vérifie que la pièce appartient au joueur courant
    private propriete(x: number, y: number): boolean {
        const piece = this.plateau.getPiece(x, y);
        return piece !== null && piece.joueur === this.joueurCourant;
    }

    // Vérifie que la case est vide
    private caseVide(x: number, y: number): boolean {
        return this.plateau.estValide(x, y) && this.plateau.getPiece(x, y) === null;
    }

    // Vérifie un mouvement diagonal
    private diagonalSimple(x1: number, y1: number, x2: number, y2: number, piece: Piece): boolean {
        const dx = x2 - x1;
        const dy = y2 - y1;

        if (Math.abs(dx) !== 1 || Math.abs(dy) !== 1) return false;

        if (!piece.estDame) {
            if (piece.joueur === "R" && dx !== -1) return false;
            if (piece.joueur === "N" && dx !== 1) return false;
        }
        return true;
    }

    // Vérifie si un déplacement capture
    private capture(x1: number, y1: number, x2: number, y2: number, piece: Piece): boolean {
        const dx = x2 - x1;
        const dy = y2 - y1;

        if (Math.abs(dx) !== 2 || Math.abs(dy) !== 2) return false;

        const xm = x1 + dx / 2;
        const ym = y1 + dy / 2;

        const pieceIntermediaire = this.plateau.getPiece(xm, ym);
        if (!pieceIntermediaire) return false;
        if (pieceIntermediaire.joueur === this.joueurCourant) return false;

        return this.caseVide(x2, y2);
    }

    // Déplace la pièce et effectue éventuellement une capture
    private futurCapture(x1: number, y1: number, x2: number, y2: number): boolean {
        const piece = this.plateau.getPiece(x1, y1);
        if (!piece) return false;

        if (this.diagonalSimple(x1, y1, x2, y2, piece)) {
            this.plateau.deplacerPiece(x1, y1, x2, y2);
            return true;
        }

        if (this.capture(x1, y1, x2, y2, piece)) {
            const xm = x1 + (x2 - x1) / 2;
            const ym = y1 + (y2 - y1) / 2;
            // retirer la pièce capturée
            this.plateau.supprimerPiece(xm, ym);
            this.plateau.deplacerPiece(x1, y1, x2, y2);
            return true;
        }

        return false;
    }

    // Jouer un coup
    lancerCoup(x1: number, y1: number, x2: number, y2: number): void {
        if (!this.propriete(x1, y1)) {
            console.log("Ce n'est pas votre pièce !");
            return;
        }

        if (!this.caseVide(x2, y2)) {
            console.log("Case de destination occupée !");
            return;
        }

        const valide = this.futurCapture(x1, y1, x2, y2);
        if (!valide) {
            console.log("Mouvement invalide !");
            return;
        }

        // Changer de joueur
        this.joueurCourant = this.joueurCourant === "R" ? "N" : "R";
        this.afficherPiece();
    }
}