# Remettre le dépôt à un ami

Deux options :
- **Fork** : votre ami clique Fork sur GitHub. Il a sa copie, vous gardez la vôtre ; les améliorations peuvent circuler par PR.
- **Transfert de propriété** : le propriétaire actuel utilise Settings → General → Danger Zone → Transfer ownership et indique le compte exact du destinataire. Celui-ci accepte l'invitation. Ce starter ne réalise aucun transfert automatiquement.

Après transfert : mettre à jour l'URL du clone dans README, les remotes locaux et les réglages Actions. Configurer ses propres secrets uniquement si les services optionnels sont utilisés. Examiner aussi les collaborateurs, webhooks et éventuels secrets avant tout transfert ; ne pas transmettre les accès de l'auteur.

Le code est sous MIT, les licences des dépendances et ressources restent applicables. Nova et example.com sont des placeholders. Les références externes sont conservées comme liens et analyses crédités, pas comme autorisation de réutiliser leurs médias.
