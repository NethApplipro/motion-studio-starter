import {Config} from '@remotion/cli/config';

// Rendu déterministe : JPEG intermédiaires, H.264 CRF 16, yuv420p (lisible partout).
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
// bt709 = standard vidéo HD (plage TV). Sans lui, les images JPEG donnent du yuvj420p « plein écart ».
Config.setColorSpace('bt709');
Config.setOverwriteOutput(true);

// Si Remotion ne peut pas télécharger son Chrome (réseau filtré), pointer vers un binaire local :
// REMOTION_BROWSER=/chemin/vers/headless_shell npm run render
if (process.env.REMOTION_BROWSER) {
	Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
