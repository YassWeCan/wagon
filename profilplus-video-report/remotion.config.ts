import { Config } from "@remotion/cli/config";
import { existsSync, readFileSync } from "node:fs";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// yuv420p = format lisible partout (iPhone, Safari, WhatsApp, PowerPoint). Sans ça, certains lecteurs affichent un écran noir.
Config.setPixelFormat("yuv420p");

// Si Remotion n'arrive pas à télécharger son navigateur, indique un Chrome/Chromium existant
// dans .env : REMOTION_BROWSER=/chemin/vers/chrome
const env = existsSync(".env") ? readFileSync(".env", "utf8") : "";
const navigateur = process.env.REMOTION_BROWSER ?? env.match(/^REMOTION_BROWSER=(.+)$/m)?.[1]?.trim();
if (navigateur) Config.setBrowserExecutable(navigateur);
