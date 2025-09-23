// Projet: Création du jeu de Dames
import * as readlineSync from 'readline-sync';

// CLASSE : Pièce
export class Piece {
    joueur: string; // "R" (rouge) ou "N" (noir)
    estDame: boolean;

    constructor(joueur: string, estDame: boolean = false) {
        this.joueur = joueur;
        this.estDame = estDame;
    }

    // Obtenir une représentation textuelle
    affichage(): string {
        if (this.estDame) {
            return this.joueur.toUpperCase(); // R ou N (dame)
        } else {
            return this.joueur.toLowerCase(); // r ou n (pion)
        }
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
                if (casePlateau) {
                    ligne += casePlateau.affichage() + " ";
                } else {
                    ligne += ". ";
                }
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
        if (!this.estValide(x, y)) {
            return null;
        } else {
            return this.grille[x][y];
        }
    }

    // Déplacer une pièce
    deplacerPiece(x1: number, y1: number, x2: number, y2: number): boolean {
        if (!this.estValide(x1, y1) || !this.estValide(x2, y2)) {
            return false;
        }
        const piece = this.grille[x1][y1];
        if (!piece) {
            return false;
        }

        this.grille[x2][y2] = piece;
        this.grille[x1][y1] = null;

        // Promotion si arrivée au bout
        if ((piece.joueur === "R" && x2 === 0) || (piece.joueur === "N" && x2 === this.taille - 1)) {
            piece.estDame = true;
        }

        return true;
    }

    // Supprimer une pièce à la position donnée
    supprimerPiece(x: number, y: number): void {
        if (this.estValide(x, y)) {
            this.grille[x][y] = null;
        }
    }
}

// CLASSE : Règles de base
export class BaseRegles {
    private plateau: Plateau;
    private joueurCourant: string;

    constructor() {
        // Initialiser le plateau et commence avec le joueur rouge
        this.plateau = new Plateau();
        this.joueurCourant = "R";
    }
    // Accès au plateau
    public getPlateau(): Plateau {
        return this.plateau;
    }

    // Accès au jouer courant
    public getJoueurCourant(): string {
        return this.joueurCourant;
    }

    // Retourner la valeur absolue d'un nombre
    private absolute(x: number): number {
        if (x >= 0) {
            return x;
        } else {
            return -x;
        }
    }

    // Afficher le plateau avec le joueur courant
    afficherPiece(): void {
        console.log(`Jouer courant : ${this.joueurCourant}`);
        this.plateau.afficher();
    }

    // Vérifier que la pièce appartient au joueur courant
    public propriete(x: number, y: number): boolean {
        const piece = this.plateau.getPiece(x, y);
        if (piece !== null && piece.joueur === this.joueurCourant) {
            return true;
        } else {
            return false;
        }
    }

    // Vérifier que la case est vide
    private caseVide(x: number, y: number): boolean {
        if (this.plateau.estValide(x, y) && this.plateau.getPiece(x, y) === null) {
            return true;
        } else {
            return false;
        }
    }

    // Vérifier un mouvement diagonal simple
    private diagonalSimple(x1: number, y1: number, x2: number, y2: number, piece: Piece): boolean {
        const diagonalx = x2 - x1;
        const diagonaly = y2 - y1;

        // Déplacement doit être exactement d'une case en diagonale
        if (this.absolute(diagonalx) !== 1 || this.absolute(diagonaly) !== 1) {
            return false;
        }

        // Vérifie la direction du pion si ce n’est pas une dame
        if (!piece.estDame) {
            if (piece.joueur === "R" && diagonalx !== -1) {
                return false;
            }
            if (piece.joueur === "N" && diagonalx !== 1) {
                return false;
            }
        }
        return true;
    }

    // Vérifier si un mouvement est une capture
    private capture(x1: number, y1: number, x2: number, y2: number, piece: Piece): boolean {
        const diagonalx = x2 - x1;
        const diagonaly = y2 - y1;

        if (this.absolute(diagonalx) !== 2 || this.absolute(diagonaly) !== 2) {
            return false;
        }

        const xm = x1 + diagonalx / 2;
        const ym = y1 + diagonaly / 2;

        const pieceCoince = this.plateau.getPiece(xm, ym);
        if (!pieceCoince) {
            return false;
        }
        if (pieceCoince.joueur === this.joueurCourant) {
            return false;
        }
        return this.caseVide(x2, y2);
    }

    // Déplacer la pièce et effectuer un mouvement (simple ou capture)
    private futurCapture(x1: number, y1: number, x2: number, y2: number): "simple" | "capture" | null {
        const piece = this.plateau.getPiece(x1, y1);
        if (!piece) {
            return null;
        }

        // Déplacement simple
        if (this.diagonalSimple(x1, y1, x2, y2, piece)) {
            this.plateau.deplacerPiece(x1, y1, x2, y2);
            return "simple";
        }

        // Déplacement avec capture
        if (this.capture(x1, y1, x2, y2, piece)) {
            const xm = x1 + (x2 - x1) / 2;
            const ym = y1 + (y2 - y1) / 2;

            this.plateau.supprimerPiece(xm, ym);
            this.plateau.deplacerPiece(x1, y1, x2, y2);

            // Après une capture, vérifier si une autre capture est possible
            if (this.capturerEnChaine(x2, y2, piece)) {
                console.log("Vous pouvez continuez les captures!");
            }

            return "capture";
        }

        return null;
    }
    
    // Vérifier s’il reste des captures possibles
    private capturerEnChaine(x: number, y: number, piece: Piece): boolean {
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

    private captureForce(): boolean {
        // Parcourir toutes les cases du plateau
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const piece = this.plateau.getPiece(x, y);
                if (piece && piece.joueur === this.joueurCourant) {
                    if (this.capturerEnChaine(x, y, piece)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // Jouer un coup
    lancerCoup(x1: number, y1: number, x2: number, y2: number): boolean {
        // Vérifier si une capture est obligatoire
        if (this.captureForce()) {
            const piece = this.plateau.getPiece(x1, y1);
            if (!piece || !this.capturerEnChaine(x1, y1, piece)) {
                return false;
            }
        }

        if (!this.propriete(x1, y1)) {
            return false;
        }

        if (!this.caseVide(x2, y2)) {
            return false;
        }

        const resultat = this.futurCapture(x1, y1, x2, y2);

        if (!resultat) {
            return false;
        }

        // Changer le joueur si nécessaire
        if (resultat === "simple") {
            this.joueurCourant = this.joueurCourant === "R" ? "N" : "R";
        } else if (resultat === "capture") {
            const piece = this.plateau.getPiece(x2, y2);
            if (piece && !this.capturerEnChaine(x2, y2, piece)) {
                this.joueurCourant = this.joueurCourant === "R" ? "N" : "R";
            }
        }

        this.afficherPiece();
        return true;
    }
}

export class Victoire {
    private plateau: Plateau;

    constructor(plateau: Plateau) {
        this.plateau = plateau;
    }

    // Vérifier si un joueur n’a plus de pièces
    private sansPieces(joueur: string): boolean {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = this.plateau.getPiece(i, j);
                if (piece && piece.joueur === joueur) {
                    return false;
                }
            }
        }
        return true;
    }

    // Vérifier si un joueur n’a plus de mouvements possibles
    private sansMouvement(joueur: string): boolean {
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const piece = this.plateau.getPiece(x, y);
                if (piece && piece.joueur === joueur) {
                    // tester les 4 diagonales
                    const directions = [
                        { dx: 1, dy: 1 },
                        { dx: 1, dy: -1 },
                        { dx: -1, dy: 1 },
                        { dx: -1, dy: -1 }
                    ];
                    for (const dir of directions) {
                        const nx = x + dir.dx;
                        const ny = y + dir.dy;
                        if (this.plateau.estValide(nx, ny) && this.plateau.getPiece(nx, ny) === null) {
                            return false;
                        }
                    }
                }
            }
        }
        return true; // aucun mouvement possible
    }

    // Vérifier si la partie est gagnée
    victoireCheck(): string | null {
        const rougePerd = this.sansPieces("R") || this.sansMouvement("R");
        const noirPerd = this.sansPieces("N") || this.sansMouvement("N");

        if (rougePerd && noirPerd) {
            return "Match nul!";
        }
        if (rougePerd) {
            return "Victoire du joueur Noir!";
        }
        if (noirPerd) {
            return "Victoire du joueur Rouge!";
        }
        return null;
    }
}

function lancerPartie() {
    const jeu = new BaseRegles();
    const victoire = new Victoire(jeu.getPlateau());
    // Début de la partie
    let debutPartie = true;

    while (debutPartie) {
        console.clear?.();
        console.log(`Joueur actuel : ${jeu.getJoueurCourant()}`);
        jeu.afficherPiece();

        let coupUtilise = false;

        while (!coupUtilise) {
            const x1 = Number(readlineSync.question("Entrez la ligne de la pièce à déplacer (0-7) : "));
            const y1 = Number(readlineSync.question("Entrez la colonne de la pièce à déplacer (0-7) : "));
            const x2 = Number(readlineSync.question("Entrez la ligne de destination (0-7) : "));
            const y2 = Number(readlineSync.question("Entrez la colonne de destination (0-7) : "));

            // Vérifier que la pièce appartient au joueur courant
            if (!jeu.propriete(x1, y1)) {
                continue;
            }

            // lancerCoup renvoie true si le coup est valide
            coupUtilise = jeu.lancerCoup(x1, y1, x2, y2);
        }

        const resultat = victoire.victoireCheck();
        if (resultat !== null) {
            console.clear?.();
            jeu.afficherPiece();
            console.log(resultat);
            debutPartie = false;
        }
    }
}

lancerPartie();