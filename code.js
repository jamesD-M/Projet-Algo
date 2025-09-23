"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRegles = exports.Plateau = exports.Piece = void 0;
// Projet: Création du jeu de Dames
// 1. Création de classe: pièces
var Piece = /** @class */ (function () {
    function Piece(joueur, estDame) {
        if (estDame === void 0) { estDame = false; }
        this.joueur = joueur;
        this.estDame = estDame;
    }
    // Obtenir une représentation textuelle
    Piece.prototype.affichage = function () {
        if (this.estDame) {
            return this.joueur.toUpperCase(); // R ou B
        }
        return this.joueur.toLowerCase(); // r ou b
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
                ligne += (casePlateau ? casePlateau.affichage() : ".") + " ";
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
        if (!this.estValide(x, y))
            return null;
        return this.grille[x][y];
    };
    // Déplacer une pièce
    Plateau.prototype.deplacerPiece = function (x1, y1, x2, y2) {
        if (!this.estValide(x1, y1) || !this.estValide(x2, y2)) {
            return false;
        }
        var piece = this.grille[x1][y1];
        if (!piece)
            return false;
        this.grille[x2][y2] = piece;
        this.grille[x1][y1] = null;
        // Promotion si arrivée au bout
        if ((piece.joueur === "R" && x2 === 0) || (piece.joueur === "N" && x2 === this.taille - 1)) {
            piece.estDame = true;
        }
        return true;
    };
    // Supprime une pièce à la position donnée
    Plateau.prototype.supprimerPiece = function (x, y) {
        if (this.estValide(x, y)) {
            this.grille[x][y] = null;
        }
    };
    return Plateau;
}());
exports.Plateau = Plateau;
var BaseRegles = /** @class */ (function () {
    function BaseRegles() {
        // lance le plateau et commence avec le jouer rouge
        this.plateau = new Plateau();
        // le rouge commence
        this.joueurCourant = "R";
    }
    // Retourne la valeure absolue d'un nombre
    BaseRegles.prototype.absolute = function (x) {
        return x >= 0 ? x : -x;
    };
    // Afficher le plateau avec le joueur courant
    BaseRegles.prototype.afficherPiece = function () {
        console.log("Jouer courant : ".concat(this.joueurCourant));
        this.plateau.afficher();
    };
    // Vérifie que la pièce appartient au joueur courant
    BaseRegles.prototype.propriete = function (x, y) {
        var piece = this.plateau.getPiece(x, y);
        return piece !== null && piece.joueur === this.joueurCourant;
    };
    // Vérifie que la case est vide
    BaseRegles.prototype.caseVide = function (x, y) {
        return this.plateau.estValide(x, y) && this.plateau.getPiece(x, y) === null;
    };
    // Vérifie un mouvement diagonal
    BaseRegles.prototype.diagonalSimple = function (x1, y1, x2, y2, piece) {
        var diagonalx = x2 - x1;
        var diagonaly = y2 - y1;
        // Comme math(abs) n'est pas possible... cette ligne est donc la pour s'assurer que le déplacement change uniquement que d'une case
        if (this.absolute(diagonalx) !== 1 || this.absolute(diagonaly) !== 1)
            return false;
        if (!piece.estDame) {
            if (piece.joueur === "R" && diagonalx !== -1)
                return false;
            if (piece.joueur === "N" && diagonalx !== 1)
                return false;
        }
        return true;
    };
    // Vérifie si un déplacement capture
    BaseRegles.prototype.capture = function (x1, y1, x2, y2, piece) {
        var diagonalx = x2 - x1;
        var diagonaly = y2 - y1;
        if (this.absolute(diagonalx) !== 2 || this.absolute(diagonaly) !== 2)
            return false;
        var xm = x1 + diagonalx / 2;
        var ym = y1 + diagonaly / 2;
        var pieceCoince = this.plateau.getPiece(xm, ym);
        if (!pieceCoince)
            return false;
        if (pieceCoince.joueur === this.joueurCourant)
            return false;
        return this.caseVide(x2, y2);
    };
    // Déplace la pièce et effectue une capture
    BaseRegles.prototype.futurCapture = function (x1, y1, x2, y2) {
        var piece = this.plateau.getPiece(x1, y1);
        if (!piece)
            return false;
        if (this.diagonalSimple(x1, y1, x2, y2, piece)) {
            this.plateau.deplacerPiece(x1, y1, x2, y2);
            return true;
        }
        if (this.capture(x1, y1, x2, y2, piece)) {
            var xm = x1 + (x2 - x1) / 2;
            var ym = y1 + (y2 - y1) / 2;
            // retirer la pièce capturée
            this.plateau.supprimerPiece(xm, ym);
            this.plateau.deplacerPiece(x1, y1, x2, y2);
            return true;
        }
        return false;
    };
    // Jouer un coup
    BaseRegles.prototype.lancerCoup = function (x1, y1, x2, y2) {
        if (!this.propriete(x1, y1)) {
            console.log("Cette pièce n'est pas à vous!");
            return;
        }
        if (!this.caseVide(x2, y2)) {
            console.log("Case occupée!");
            return;
        }
        var valide = this.futurCapture(x1, y1, x2, y2);
        if (!valide) {
            console.log("Mouvement invalide!");
            return;
        }
        // Changer de joueur
        this.joueurCourant = this.joueurCourant === "R" ? "N" : "R";
        this.afficherPiece();
    };
    return BaseRegles;
}());
exports.BaseRegles = BaseRegles;
