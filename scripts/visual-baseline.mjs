// Décision des tests visuels pour une image (fonction pure, testée).
// Une référence manquante est un ÉCHEC, jamais une création silencieuse : sinon un film oublié dans
// tests/visual/baseline/ passerait au vert sans avoir été comparé. Les références se créent seulement avec --update,
// dans la CI (.github/workflows/visual-references.yml), pour garder le même navigateur que la vérification.
export function baselineAction({update, exists}) {
	if (update) return 'write';
	return exists ? 'compare' : 'missing';
}
