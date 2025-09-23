import * as readlineSync from 'readline-sync';

// CLASSE : Pièce
export class Piece {
    joueur: string; // "R" ou "N"
    estDame: boolean;

    constructor(joueur: string, estDame: boolean = false) {
        this.joueur = joueur;
        this.estDame = estDame;
    }

    affichage(): string {
        return this.estDame ? this.joueur.toUpperCase() : this.joueur.toLowerCase();
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
        for (let i = 0; i < this.taille; i++) {
            this.grille[i] = [];
            for (let j = 0; j < this.taille; j++) {
                this.grille[i][j] = null;
            }
        }

        // Noires en haut
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < this.taille; j++)
                if ((i + j) % 2 === 1) this.grille[i][j] = new Piece("N");

        // Rouges en bas
        for (let i = this.taille - 3; i < this.taille; i++)
            for (let j = 0; j < this.taille; j++)
                if ((i + j) % 2 === 1) this.grille[i][j] = new Piece("R");
    }

    afficher(): void {
        console.log("  0 1 2 3 4 5 6 7");
        for (let i = 0; i < this.taille; i++) {
            let ligne = i + " ";
            for (let j = 0; j < this.taille; j++) {
                ligne += this.grille[i][j]?.affichage() ?? ".";
                ligne += " ";
            }
            console.log(ligne);
        }
    }

    estValide(x: number, y: number): boolean {
        return x >= 0 && x < this.taille && y >= 0 && y < this.taille;
    }

    getPiece(x: number, y: number): Piece | null {
        return this.estValide(x, y) ? this.grille[x][y] : null;
    }

    deplacerPiece(x1: number, y1: number, x2: number, y2: number): void {
        const piece = this.grille[x1][y1];
        if (!piece) return;

        this.grille[x2][y2] = piece;
        this.grille[x1][y1] = null;

        // Promotion après tous les coups
        if (!piece.estDame && ((piece.joueur === "R" && x2 === 0) || (piece.joueur === "N" && x2 === this.taille - 1))) {
            piece.estDame = true;
        }
    }

    supprimerPiece(x: number, y: number): void {
        if (this.estValide(x, y)) this.grille[x][y] = null;
    }
}

// CLASSE : Règles
export class BaseRegles {
    private plateau: Plateau;
    private joueurCourant: string;

    constructor() {
        this.plateau = new Plateau();
        this.joueurCourant = "R";
    }

    getPlateau(): Plateau { return this.plateau; }
    getJoueurCourant(): string { return this.joueurCourant; }

    private absolute(x: number): number { return x >= 0 ? x : -x; }

    public afficherPiece(): void {
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

        const xm = x1 + dx / 2;
        const ym = y1 + dy / 2;
        const pieceCoince = this.plateau.getPiece(xm, ym);
        return pieceCoince !== null && pieceCoince.joueur !== this.joueurCourant && this.caseVide(x2, y2);
    }

    private capturerEnChaine(x: number, y: number, piece: Piece): boolean {
        const dirs = [
            { dx: 2, dy: 2 }, { dx: 2, dy: -2 },
            { dx: -2, dy: 2 }, { dx: -2, dy: -2 }
        ];
        return dirs.some(dir => this.capture(x, y, x + dir.dx, y + dir.dy, piece));
    }

    private captureForce(): boolean {
        for (let x = 0; x < 8; x++)
            for (let y = 0; y < 8; y++) {
                const piece = this.plateau.getPiece(x, y);
                if (piece && piece.joueur === this.joueurCourant && this.capturerEnChaine(x, y, piece)) return true;
            }
        return false;
    }

    private piecePeutCapturer(x: number, y: number): boolean {
        const piece = this.plateau.getPiece(x, y);
        return piece !== null && piece.joueur === this.joueurCourant && this.capturerEnChaine(x, y, piece);
    }

    private futurCapture(x1: number, y1: number, x2: number, y2: number): "simple" | "capture" | null {
        const piece = this.plateau.getPiece(x1, y1);
        if (!piece) return null;
        if (this.diagonalSimple(x1, y1, x2, y2, piece)) return "simple";
        if (this.capture(x1, y1, x2, y2, piece)) return "capture";
        return null;
    }

    public actionsPossibles(x: number, y: number): boolean {
        const piece = this.plateau.getPiece(x, y);
        if (!piece || piece.joueur !== this.joueurCourant) return false;

        // Simple moves
        const dirs = [
            { dx: 1, dy: 1 }, { dx: 1, dy: -1 },
            { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
        ];
        for (const dir of dirs) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            if (this.plateau.estValide(nx, ny) && this.plateau.getPiece(nx, ny) === null) return true;
        }

        // Capture
        return this.capturerEnChaine(x, y, piece);
    }

    public lancerCoup(x1: number, y1: number, x2: number, y2: number): "ok" | "captureManquante" | "deplacementInvalide" | "continueCapture" {
        if (!this.propriete(x1, y1) || !this.caseVide(x2, y2)) {
            return "deplacementInvalide";
        }

        // Vérifier capture obligatoire
        if (this.captureForce() && !this.piecePeutCapturer(x1, y1)) {
            return "captureManquante";
        }

        const piece = this.plateau.getPiece(x1, y1);
        if (!piece) return "deplacementInvalide";

        const resultat = this.futurCapture(x1, y1, x2, y2);
        if (!resultat) return "deplacementInvalide";

        if (resultat === "simple") {
            this.plateau.deplacerPiece(x1, y1, x2, y2);
            return "ok";
        } else if (resultat === "capture") {
            const xm = x1 + (x2 - x1) / 2;
            const ym = y1 + (y2 - y1) / 2;
            this.plateau.supprimerPiece(xm, ym);
            this.plateau.deplacerPiece(x1, y1, x2, y2);

            // Vérifier capture en chaîne
            if (this.capturerEnChaine(x2, y2, piece)) {
                return "continueCapture";
            }
            return "ok";
        }

        return "deplacementInvalide";
    }
}

// CLASSE : Victoire
export class Victoire {
    private plateau: Plateau;
    private regles: BaseRegles;

    constructor(plateau: Plateau, regles: BaseRegles) {
        this.plateau = plateau;
        this.regles = regles;
    }

    private sansPieces(joueur: string): boolean {
        for (let i = 0; i < 8; i++)
            for (let j = 0; j < 8; j++)
                if (this.plateau.getPiece(i, j)?.joueur === joueur) return false;
        return true;
    }

    private sansMouvement(joueur: string): boolean {
        for (let x = 0; x < 8; x++)
            for (let y = 0; y < 8; y++) {
                const piece = this.plateau.getPiece(x, y);
                if (piece && piece.joueur === joueur) {
                    const joueurCourantSauve = this.regles.getJoueurCourant();
                    (this.regles as any).joueurCourant = joueur;

                    if (this.regles.actionsPossibles(x, y)) {
                        (this.regles as any).joueurCourant = joueurCourantSauve;
                        return false;
                    }

                    (this.regles as any).joueurCourant = joueurCourantSauve;
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

// Lancement du jeu
function lancerPartie() {
    const jeu = new BaseRegles();
    const victoire = new Victoire(jeu.getPlateau(), jeu);

    let debutPartie = true;
    while (debutPartie) {
        console.clear?.();
        console.log(`Joueur actuel : ${jeu.getJoueurCourant()}`);
        jeu.afficherPiece();

        let coupValide = false;
        while (!coupValide) {
            const x1 = Number(readlineSync.question("Ligne de la pièce à déplacer (0-7) : "));
            const y1 = Number(readlineSync.question("Colonne de la pièce à déplacer (0-7) : "));
            const x2 = Number(readlineSync.question("Ligne de destination (0-7) : "));
            const y2 = Number(readlineSync.question("Colonne de destination (0-7) : "));

            const resultat = jeu.lancerCoup(x1, y1, x2, y2);

            switch (resultat) {
                case "ok":
                    coupValide = true;
                    break;
                case "captureManquante":
                    console.log("Vous devez capturer une pièce !");
                    readlineSync.question("Appuyez sur Entrée pour continuer...");
                    break;
                case "deplacementInvalide":
                    console.log("Déplacement invalide !");
                    readlineSync.question("Appuyez sur Entrée pour continuer...");
                    break;
                case "continueCapture":
                    console.log("Vous devez continuer à capturer avec la même pièce !");
                    readlineSync.question("Appuyez sur Entrée pour continuer...");
                    // Ne pas changer joueur, laisser le coup en cours
                    coupValide = true;
                    break;
            }
        }

        // Vérifier victoire
        const resultatVictoire = victoire.victoireCheck();
        if (resultatVictoire) {
            console.clear?.();
            jeu.afficherPiece();
            console.log(resultatVictoire);
            debutPartie = false;
        }
    }
}
lancerPartie();