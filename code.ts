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

    estValide(x: number, y: number): boolean {
        return x >= 0 && x < this.taille && y >= 0 && y < this.taille;
    }

    getPiece(x: number, y: number): Piece | null {
        if (!this.estValide(x, y)) {
            return null;
        } else {
            return this.grille[x][y];
        }
    }

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
        this.plateau = new Plateau();
        this.joueurCourant = "R";
    }

    public getPlateau(): Plateau {
        return this.plateau;
    }

    public getJoueurCourant(): string {
        return this.joueurCourant;
    }

    private absolute(x: number): number {
        return x >= 0 ? x : -x;
    }

    afficherPiece(): void {
        console.log(`Joueur courant : ${this.joueurCourant}`);
        this.plateau.afficher();
    }

    public propriete(x: number, y: number): boolean {
        const piece = this.plateau.getPiece(x, y);
        return piece !== null && piece.joueur === this.joueurCourant;
    }

    private caseVide(x: number, y: number): boolean {
        return this.plateau.estValide(x, y) && this.plateau.getPiece(x, y) === null;
    }

    private diagonalSimple(x1: number, y1: number, x2: number, y2: number, piece: Piece): boolean {
        const dx = x2 - x1;
        const dy = y2 - y1;

        if (this.absolute(dx) !== 1 || this.absolute(dy) !== 1) return false;

        if (!piece.estDame) {
            if (piece.joueur === "R" && dx !== -1) return false;
            if (piece.joueur === "N" && dx !== 1) return false;
        }

        return true;
    }

    private capture(x1: number, y1: number, x2: number, y2: number, piece: Piece): boolean {
        const dx = x2 - x1;
        const dy = y2 - y1;

        if (this.absolute(dx) !== 2 || this.absolute(dy) !== 2) return false;

        if (!piece.estDame) {
            if (piece.joueur === "R" && dx !== -2) return false;
            if (piece.joueur === "N" && dx !== 2) return false;
        }

        const xm = x1 + dx / 2;
        const ym = y1 + dy / 2;

        const pieceCoince = this.plateau.getPiece(xm, ym);
        if (!pieceCoince) return false;
        if (pieceCoince.joueur === this.joueurCourant) return false;
        return this.caseVide(x2, y2);
    }

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

            if (this.capturerEnChaine(x2, y2, piece)) {
                console.log("Vous pouvez continuez les captures!");
            }

            return "capture";
        }

        return null;
    }

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
            if (this.capture(x, y, nx, ny, piece)) return true;
        }

        return false;
    }

    private captureForce(): boolean {
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const piece = this.plateau.getPiece(x, y);
                if (piece && piece.joueur === this.joueurCourant) {
                    const directions = [
                        { dx: 2, dy: 2 },
                        { dx: 2, dy: -2 },
                        { dx: -2, dy: 2 },
                        { dx: -2, dy: -2 }
                    ];
                    for (const dir of directions) {
                        const nx = x + dir.dx;
                        const ny = y + dir.dy;
                        if (this.capture(x, y, nx, ny, piece)) return true;
                    }
                }
            }
        }
        return false;
    }

    lancerCoup(x1: number, y1: number, x2: number, y2: number): boolean {
        const captureObligatoire = this.captureForce();
        const piece = this.plateau.getPiece(x1, y1);

        if (!piece || piece.joueur !== this.joueurCourant) {
            console.log("C'est pas votre pièce !");
            return false;
        }

        const estCapture = this.capture(x1, y1, x2, y2, piece);

        if (captureObligatoire && !estCapture) {
            console.log("Vous devez capturer !");
            return false;
        }

        if (!this.caseVide(x2, y2)) {
            console.log("La case de destination n'est pas vide !");
            return false;
        }

        const resultat = this.futurCapture(x1, y1, x2, y2);
        if (!resultat) {
            console.log("Coup invalide !");
            return false;
        }

        if (resultat === "simple") {
            this.joueurCourant = this.joueurCourant === "R" ? "N" : "R";
        } else if (resultat === "capture") {
            if (!this.capturerEnChaine(x2, y2, piece)) {
                this.joueurCourant = this.joueurCourant === "R" ? "N" : "R";
            }
        }

        this.afficherPiece();
        return true;
    }
}

// CLASSE : Victoire
export class Victoire {
    private plateau: Plateau;

    constructor(plateau: Plateau) {
        this.plateau = plateau;
    }

    private sansPieces(joueur: string): boolean {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = this.plateau.getPiece(i, j);
                if (piece && piece.joueur === joueur) return false;
            }
        }
        return true;
    }

    private sansMouvement(joueur: string): boolean {
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const piece = this.plateau.getPiece(x, y);
                if (piece && piece.joueur === joueur) {
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
        return true;
    }

    victoireCheck(): string | null {
        const rougePerd = this.sansPieces("R") || this.sansMouvement("R");
        const noirPerd = this.sansPieces("N") || this.sansMouvement("N");

        if (rougePerd && noirPerd) return "Match nul!";
        if (rougePerd) return "Victoire du joueur Noir!";
        if (noirPerd) return "Victoire du joueur Rouge!";
        return null;
    }
}

// Fonction pour lancer le jeu
function lancerPartie() {
    const jeu = new BaseRegles();
    const victoire = new Victoire(jeu.getPlateau());
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

type Move = [number, number, number, number, string];

// DÉMONSTRATION AUTOMATIQUE
function demoPartie() {
    // ✅ Toutes les coordonnées sont des nombres
    const moves: Move[] = [
        [5, 0, 4, 1, "Le joueur Rouge avance"],
        [2, 1, 3, 0, "Le joueur Noir avance"],
        [5, 2, 4, 3, "Le joueur Rouge avance"],
        [2, 3, 3, 4, "Le joueur Noir avance"],
        [4, 3, 2, 5, "Le joueur Rouge capture un pion Noir"],
        [1, 4, 2, 3, "Le joueur Noir avance"],
        [2, 5, 0, 7, "Le joueur Rouge capture et devient Dame"],
    ];

    const jeu = new BaseRegles();
    const victoire = new Victoire(jeu.getPlateau());

    console.log("=== Démonstration automatique du jeu de dames ===\n");

    for (let [x1, y1, x2, y2, desc] of moves) {
        // Conversion explicite pour TypeScript
        const x1n = Number(x1);
        const y1n = Number(y1);
        const x2n = Number(x2);
        const y2n = Number(y2);

        console.log(`Joueur actuel : ${jeu.getJoueurCourant()}`);
        jeu.afficherPiece();
        console.log(`Action prévue : ${desc}`);
        console.log(`Tentative de déplacement : (${x1n},${y1n}) → (${x2n},${y2n})`);

        const valide = jeu.lancerCoup(x1n, y1n, x2n, y2n);

        if (!valide) {
            console.log("❌ Coup rejeté par les règles\n");
        } else {
            console.log("✅ Coup accepté\n");
        }

        const resultat = victoire.victoireCheck();
        if (resultat) {
            console.log("=== Partie terminée ===");
            jeu.afficherPiece();
            console.log(resultat);
            return;
        }

        console.log("...\n");
    }

    console.log("Fin démo");
}

demoPartie();