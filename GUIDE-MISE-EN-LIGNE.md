# Site de l'UNPECA — Guide de mise en ligne et de gestion

Ce dossier contient le site complet, prêt à être publié. Il est **bilingue (français / anglais)**, s'adapte aux téléphones et ne nécessite aucun serveur payant.

## 1. Ce que contient le site

| Page | Fichier | Contenu |
|---|---|---|
| Accueil | `index.html` | Présentation, principes, domaines, dernières actualités |
| À propos | `a-propos.html` | Identité, mission, vision, valeurs, informations légales |
| Projets | `projets.html` | Domaines d'intervention + fiches projets |
| Actualités | `actualites.html` | Liste des actualités |
| Galerie | `galerie.html` | Photos et vidéos YouTube |
| Équipe | `equipe.html` | Membres de l'équipe |
| Partenaires | `partenaires.html` | Logos / noms des partenaires |
| Documents | `documents.html` | Fichiers à télécharger |
| Contact | `contact.html` | Coordonnées, formulaire, WhatsApp, carte Google Maps |

Les actualités, projets, photos, vidéos, équipe, partenaires, documents et liens de réseaux sociaux se modifient **depuis le tableau de bord** (étape 4), sans toucher au code.

## 2. Ce qu'il faut remplacer avant de publier

1. **Formulaire de contact** : déjà relié à votre formulaire Formspree (`mvkkyvjb`). Pensez à confirmer l'email reçu de Formspree, sinon les messages ne seront pas livrés.
2. **Tableau de bord** : dans `admin/config.yml`, remplacez `VOTRE-COMPTE-GITHUB/unpeca-site` par le nom réel de votre dépôt (étape 4).
3. **Coordonnées** : le site affiche `unpecahumanitaire@gmail.com` et `+223 76 36 90 55` (le même numéro sert à WhatsApp). Pour en changer, demandez-moi de régénérer les pages.
4. **Réseaux sociaux** : les icônes Facebook / YouTube / LinkedIn / Instagram n'apparaissent que lorsque vous collez les liens dans le tableau de bord (rubrique « Réseaux sociaux »).

## 3. Activer le formulaire de contact (gratuit)

1. Créez un compte sur **formspree.io** et créez un nouveau formulaire avec l'adresse qui doit recevoir les messages.
2. Formspree vous donne une adresse du type `https://formspree.io/f/abcdwxyz`.
3. Ouvrez `contact.html` dans un éditeur de texte, remplacez `https://formspree.io/f/VOTRE_ID` par cette adresse, enregistrez.
   (Ou envoyez-moi l'adresse et je le fais.)

Le plan gratuit a un nombre limité de messages par mois : vérifiez les conditions actuelles sur leur site.

## 4. Publier le site et activer le tableau de bord

La méthode recommandée utilise GitHub (gratuit). Elle permet d'avoir le site en ligne **et** de publier vous-mêmes des actualités.

### 4.1 Créer le dépôt
1. Créez un compte sur **github.com**.
2. Créez un nouveau dépôt nommé `unpeca-site` (public).
3. Envoyez-y tout le contenu de ce dossier (bouton « Add file » → « Upload files », puis glissez les fichiers et dossiers).

### 4.2 Mettre le site en ligne (choisissez une option)
- **GitHub Pages** : dans le dépôt, « Settings » → « Pages » → source : branche `main`, dossier `/ (root)`. Le site sera à l'adresse `https://VOTRE-COMPTE.github.io/unpeca-site/`.
- **Cloudflare Pages** ou **Netlify** : connectez votre compte GitHub, choisissez le dépôt, sans commande de construction, dossier de publication : la racine. Vous obtenez une adresse gratuite du type `unpeca.pages.dev` ou `unpeca.netlify.app`.

Chaque modification enregistrée dans le dépôt met le site à jour automatiquement en quelques minutes.

### 4.3 Brancher le tableau de bord
1. Dans `admin/config.yml`, remplacez `VOTRE-COMPTE-GITHUB/unpeca-site` par votre vrai nom (ex. `unpeca-mali/unpeca-site`).
2. Sur GitHub : votre photo de profil → « Settings » → « Developer settings » → « Personal access tokens » → « Fine-grained tokens » → « Generate new token ».
   - Accès limité au dépôt `unpeca-site` uniquement.
   - Permission « Contents » : **Read and write**.
   - Copiez le jeton (il ne s'affiche qu'une fois) et conservez-le en lieu sûr.
3. Ouvrez `https://VOTRE-SITE/admin/`, cliquez « Sign in with Token » et collez le jeton.

> Ne partagez jamais ce jeton. Toute personne qui l'a peut modifier votre site. Si vous le perdez ou le montrez par erreur, supprimez-le sur GitHub et créez-en un nouveau.

### 4.4 Publier une actualité
1. Allez sur `/admin/` → « Contenu du site » → « Actualités ».
2. « Ajouter » : date, titre et résumé en français, puis en anglais (facultatif : si l'anglais est vide, le texte français s'affiche aussi en anglais), photo si vous en avez une.
3. « Publier ». L'actualité apparaît sur le site après environ une à deux minutes.

La même interface sert à gérer les projets, photos, vidéos YouTube, équipe, partenaires et documents.

> Cette partie utilise un outil externe (Sveltia CMS) que je n'ai pas pu tester en conditions réelles depuis mon environnement. Si la connexion échoue, dites-moi le message d'erreur exact et nous le corrigerons.

## 5. Nom de domaine (facultatif)
Une adresse comme `unpeca.org` fait plus professionnel. Elle s'achète auprès d'un registraire (prix annuel à vérifier chez le vendeur), puis se relie à GitHub Pages, Cloudflare ou Netlify en suivant leur documentation « custom domain ». Vérifiez la disponibilité du nom avant d'acheter.

## 6. Avant la mise en ligne : points de vigilance
- **Coordonnées bancaires** : elles ne figurent nulle part sur le site, et il est déconseillé de les publier. Votre PDF de présentation les affiche en pied de page : **ne le mettez pas dans la rubrique Documents tel quel**. Faites-en une version sans RIB.
- **Photos de personnes** : obtenez l'accord des personnes photographiées, surtout des enfants et des bénéficiaires.
- **Vérifiez les textes** : ils reprennent votre document de présentation ; les traductions anglaises sont de moi et méritent une relecture.

## 7. Structure du dossier
```
index.html, a-propos.html, projets.html, …   pages du site
css/style.css                                 apparence
js/main.js                                    langue, menu, contenus, formulaire
content/*.json                                contenus modifiables (gérés par le tableau de bord)
assets/                                       logo, icône, images envoyées
documents/                                    fichiers à télécharger
admin/                                        tableau de bord
```
