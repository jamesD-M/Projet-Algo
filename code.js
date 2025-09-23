"use strict";
// Projet: Création du jeu de Dames
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRegles = exports.Plateau = exports.Piece = void 0;
// CLASSE : Pièce
var Piece = /** @class */ (function () {
    function Piece(joueur, estDame) {
        if (estDame === void 0) { estDame = false; }
        this.joueur = joueur;
        this.estDame = estDame;
    }
    // Obtenir une représentation textuelle
    Piece.prototype.affichage = function () {
        if (this.estDame) {
            return this.joueur.toUpperCase(); // R ou N (dame)
        }
        else {
            return this.joueur.toLowerCase(); // r ou n (pion)
        }
    };
    return Piece;
}());
exports.Piece = Piece;
// CLASSE : Plateau
var Plateau = /** @class */ (function () {
    function Plateau() {
        this.taille = 8;
        this.grille = [];
        this.initialiser();
    }
    // Initialiser le plateau avec les pièces
    Plateau.prototype.initialiser = function () {
        this.grille = [];
        for (var i = 0; i < this.taille; i++) {
            this.grille[i] = [];
            for (var j = 0; j < this.taille; j++) {
                this.grille[i][j] = null;
            }
        }
        // Placer les pièces noires (en haut)
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < this.taille; j++) {
                if ((i + j) % 2 === 1) {
                    this.grille[i][j] = new Piece("N"); // joueur noir
                }
            }
        }
        // Placer les pièces rouges (en bas)
        for (var i = this.taille - 3; i < this.taille; i++) {
            for (var j = 0; j < this.taille; j++) {
                if ((i + j) % 2 === 1) {
                    this.grille[i][j] = new Piece("R"); // joueur rouge
                }
            }
        }
    };
    // Afficher le plateau
    Plateau.prototype.afficher = function () {
        console.log("  0 1 2 3 4 5 6 7");
        for (var i = 0; i < this.taille; i++) {
            var ligne = i + " ";
            for (var j = 0; j < this.taille; j++) {
                var casePlateau = this.grille[i][j];
                if (casePlateau) {
                    ligne += casePlateau.affichage() + " ";
                }
                else {
                    ligne += ". ";
                }
            }
            console.log(ligne);
        }
    };
    // Vérifier si une position est valide
    Plateau.prototype.estValide = function (x, y) {
        return x >= 0 && x < this.taille && y >= 0 && y < this.taille;
    };
    // Obtenir une pièce
    Plateau.prototype.getPiece = function (x, y) {
        if (!this.estValide(x, y)) {
            return null;
        }
        else {
            return this.grille[x][y];
        }
    };
    // Déplacer une pièce
    Plateau.prototype.deplacerPiece = function (x1, y1, x2, y2) {
        if (!this.estValide(x1, y1) || !this.estValide(x2, y2)) {
            return false;
        }
        var piece = this.grille[x1][y1];
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
    };
    // Supprimer une pièce à la position donnée
    Plateau.prototype.supprimerPiece = function (x, y) {
        if (this.estValide(x, y)) {
            this.grille[x][y] = null;
        }
    };
    return Plateau;
}());
exports.Plateau = Plateau;
// CLASSE : Règles de base
var BaseRegles = /** @class */ (function () {
    function BaseRegles() {
        // Initialiser le plateau et commence avec le joueur rouge
        this.plateau = new Plateau();
        this.joueurCourant = "R";
    }
    // Accès au plateau
    BaseRegles.prototype.getPlateau = function () {
        return this.plateau;
    };
    // Accès au jouer courant
    BaseRegles.prototype.getJoueurCourant = function () {
        return this.joueurCourant;
    };
    // Retourner la valeur absolue d'un nombre
    BaseRegles.prototype.absolute = function (x) {
        if (x >= 0) {
            return x;
        }
        else {
            return -x;
        }
    };
    // Afficher le plateau avec le joueur courant
    BaseRegles.prototype.afficherPiece = function () {
        console.log("Jouer courant : ".concat(this.joueurCourant));
        this.plateau.afficher();
    };
    // Vérifier que la pièce appartient au joueur courant
    BaseRegles.prototype.propriete = function (x, y) {
        var piece = this.plateau.getPiece(x, y);
        if (piece !== null && piece.joueur === this.joueurCourant) {
            return true;
        }
        else {
            return false;
        }
    };
    // Vérifier que la case est vide
    BaseRegles.prototype.caseVide = function (x, y) {
        if (this.plateau.estValide(x, y) && this.plateau.getPiece(x, y) === null) {
            return true;
        }
        else {
            return false;
        }
    };
    // Vérifier un mouvement diagonal simple
    BaseRegles.prototype.diagonalSimple = function (x1, y1, x2, y2, piece) {
        var diagonalx = x2 - x1;
        var diagonaly = y2 - y1;
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
    };
    // Vérifier si un mouvement est une capture
    BaseRegles.prototype.capture = function (x1, y1, x2, y2, piece) {
        var diagonalx = x2 - x1;
        var diagonaly = y2 - y1;
        if (this.absolute(diagonalx) !== 2 || this.absolute(diagonaly) !== 2) {
            return false;
        }
        var xm = x1 + diagonalx / 2;
        var ym = y1 + diagonaly / 2;
        var pieceCoince = this.plateau.getPiece(xm, ym);
        if (!pieceCoince) {
            return false;
        }
        if (pieceCoince.joueur === this.joueurCourant) {
            return false;
        }
        return this.caseVide(x2, y2);
    };
    // Déplacer la pièce et effectuer un mouvement (simple ou capture)
    BaseRegles.prototype.futurCapture = function (x1, y1, x2, y2) {
        var piece = this.plateau.getPiece(x1, y1);
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
            var xm = x1 + (x2 - x1) / 2;
            var ym = y1 + (y2 - y1) / 2;
            this.plateau.supprimerPiece(xm, ym);
            this.plateau.deplacerPiece(x1, y1, x2, y2);
            // Après une capture, vérifier si une autre capture est possible
            if (this.capturerEnChaine(x2, y2, piece)) {
                console.log("Vous pouvez continuez les captures!");
            }
            return "capture";
        }
        return null;
    };
    // Vérifier s’il reste des captures possibles
    BaseRegles.prototype.capturerEnChaine = function (x, y, piece) {
        var directions = [
            { dx: 2, dy: 2 },
            { dx: 2, dy: -2 },
            { dx: -2, dy: 2 },
            { dx: -2, dy: -2 }
        ];
        for (var _i = 0, directions_1 = directions; _i < directions_1.length; _i++) {
            var dir = directions_1[_i];
            var nx = x + dir.dx;
            var ny = y + dir.dy;
            if (this.capture(x, y, nx, ny, piece)) {
                return true;
            }
        }
        // aucune capture possible
        return false;
    };
    BaseRegles.prototype.captureForce = function () {
        // Parcourir toutes les cases du plateau
        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                var piece = this.plateau.getPiece(x, y);
                if (piece && piece.joueur === this.joueurCourant) {
                    if (this.capturerEnChaine(x, y, piece)) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    // Jouer un coup
    BaseRegles.prototype.lancerCoup = function (x1, y1, x2, y2) {
        // Vérifier si une capture est obligatoire
        if (this.captureForce()) {
            var piece = this.plateau.getPiece(x1, y1);
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
        var resultat = this.futurCapture(x1, y1, x2, y2);
        if (!resultat) {
            return false;
        }
        // Changer le joueur si nécessaire
        if (resultat === "simple") {
            this.joueurCourant = this.joueurCourant === "R" ? "N" : "R";
        }
        else if (resultat === "capture") {
            var piece = this.plateau.getPiece(x2, y2);
            if (piece && !this.capturerEnChaine(x2, y2, piece)) {
                this.joueurCourant = this.joueurCourant === "R" ? "N" : "R";
            }
        }
        this.afficherPiece();
        return true;
    };
    return BaseRegles;
}());
exports.BaseRegles = BaseRegles;
