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

export class BaseRegles {
    private plateau: Plateau;
    private joueurCourant: string;

    constructor() {
        // lance le plateau et commence avec le jouer rouge
        this.plateau = new Plateau();
        // le rouge commence
        this.joueurCourant = "R";
    }
    
    // Retourne la valeure absolue d'un nombre
    private absolute(x:number):number{
        return x >= 0 ? x : -x;
    }

    // Afficher le plateau avec le joueur courant
    afficherPiece(): void {
        console.log(`Jouer courant : ${this.joueurCourant}`);
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
        const diagonalx = x2 - x1;
        const diagonaly = y2 - y1;

        // Comme math(abs) n'est pas possible... cette ligne est donc la pour s'assurer que le déplacement change uniquement que d'une case
        if (this.absolute(diagonalx) !== 1 || this.absolute(diagonaly) !== 1) return false;

        if (!piece.estDame) {
            if (piece.joueur === "R" && diagonalx !== -1) return false;
            if (piece.joueur === "N" && diagonalx !== 1) return false;
        }
        return true;
    }

    // Vérifie si un déplacement capture
    private capture(x1: number, y1: number, x2: number, y2: number, piece: Piece): boolean {
        const diagonalx = x2 - x1;
        const diagonaly = y2 - y1;

        if (this.absolute(diagonalx) !== 2 || this.absolute(diagonaly) !== 2) return false;

        const xm = x1 + diagonalx / 2;
        const ym = y1 + diagonaly / 2;

        const pieceCoince = this.plateau.getPiece(xm, ym);
        if (!pieceCoince) return false;
        if (pieceCoince.joueur === this.joueurCourant) return false;
        return this.caseVide(x2, y2);
    }

    // Déplace la pièce et effectue une capture
    // Déplace la pièce et effectue une capture
    private futurCapture(x1: number, y1: number, x2: number, y2: number): "simple" | "capture" | null {
        const piece = this.plateau.getPiece(x1, y1);
        if (!piece) return null;

        if (this.diagonalSimple(x1, y1, x2, y2, piece)) {
            this.plateau.deplacerPiece(x1, y1, x2, y2);
            return "simple";
        }

        if (this.capture(x1, y1, x2, y2, piece)) {
            const xm = x1 + (x2 - x1) / 2;
            const ym = y1 + (y2 - y1) / 2;

            this.plateau.supprimerPiece(xm, ym);
            this.plateau.deplacerPiece(x1, y1, x2, y2);

            // après la capture, vérifier s’il y a encore une capture possible
            if (this.capturerEnChaine(x2, y2, piece)) {
                console.log("Vous pouvez continuez les captures!");
            }

            return "capture";
        }

        return null;
    }

    // Jouer un coup
    lancerCoup(x1: number, y1: number, x2: number, y2: number): void {
        if (!this.propriete(x1, y1)) {
            console.log("Cette pièce n'est pas à vous!");
            return;
        }

        if (!this.caseVide(x2, y2)) {
            console.log("Case occupée!");
            return;
        }

        const resultat = this.futurCapture(x1, y1, x2, y2);

        if (!resultat) {
            console.log("Mouvement invalide!");
            return;
        }

        // Si c'est un déplacement simple → changer de joueur
        if (resultat === "simple") {
            this.joueurCourant = this.joueurCourant === "R" ? "N" : "R";
        }

        // Si c'est une capture → vérifier s’il reste des captures
        if (resultat === "capture") {
            const piece = this.plateau.getPiece(x2, y2);
            if (piece && !this.capturerEnChaine(x2, y2, piece)) {
                // aucune capture - on change de joueur
                this.joueurCourant = this.joueurCourant === "R" ? "N" : "R";
            } else {
                // sinon - le même joueur continue
                console.log("Continuez les captures!");
            }
        }

        this.afficherPiece();
    }

    private capturerEnChaine(x: number, y: number, piece: Piece): boolean {
        // toutes les directions possibles pour une capture
        const directions = [
            { dx: 2, dy: 2 },
            { dx: 2, dy: -2 },
            { dx: -2, dy: 2 },
            { dx: -2, dy: -2 }
        ];

        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            if (this.capture(x, y, nx, ny, piece)) {
                return true;
            }
        }

        // aucune capture possible
        return false;
    }
}