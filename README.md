# Mini réseau social


## Objectif du projet

Développer un réseau social minimaliste permettant à un utilisateur de s’inscrire, de se connecter, de publier des posts (texte + image), de consulter le fil d’actualité et d’interagir avec les autres utilisateurs via un système de likes.

## Technologies utilisées

📌 Frontend : React + Vite, Tailwind CSS, React Router

📌 Backend : Supabase (Auth, Database PostgreSQL, Storage)

📌 Outils de travail : GitHub, Trello/Notion, Figma, WhatsApp

## Fonctionnalités principales

📌 Inscription / Connexion via email/password

📌 Création de post (texte + image optionnelle)

📌 Fil d’actualité (affichage des posts récents)

📌 Profil utilisateur (nom, bio, photo, liste des posts)

📌 Système de likes (like/unlike un post)

📌 Design responsive (interface claire et mobile-friendly)

📌 Navigation entre les pages principales : login, feed, profil

## Structure de la base de données (Supabase)

Table : profiles

id (UUID)

username (text)

avatar_url (text)

bio (text)

created_at (timestamp)

Table : posts

id (UUID)

user_id (UUID)

content (text)

image_url (text)

created_at (timestamp)

Table : likes

id (UUID)

user_id (UUID)

post_id (UUID)

## Planning prévisionnel

Semaine 1 : Fondations techniques et authentification Semaine 2 : Création des posts, feed, profils Semaine 3 : Likes, design final, tests, documentation, démo
Tables détaillées des tâches par jour et responsables incluses dans le document final.

## Organisation de l’équipe

Chef de projet

Frontend Lead

Backend Lead

UI/UX Designer

QA / Testeur

Documentaliste

2 Développeurs Fullstack

## Livrables attendus

Application web fonctionnelle (React + Supabase)

Code source hébergé sur GitHub ou GitLab

Documentation complète (README, cahier des charges, guide rapide)

Présentation ou démonstration interne

## Contraintes

Durée maximale : 3 semaines

Utilisation d’outils gratuits ou open-source

Priorité à la simplicité et à la cohérence visuelle

Respect des bonnes pratiques de développement

Tests manuels avant toute mise en production

## 💡 Évolutions futures possibles

Ajout de commentaires

Système de messagerie privée

Système de followers / amis

Notifications

Recherche d’utilisateurs

Mode sombre

API REST personnalisée (hors supabase)

### Auteur Membres de Dev lab ⚙️🕶️
