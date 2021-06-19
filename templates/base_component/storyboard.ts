import package_file = require("./package.json");
import Generator from "osbx/lib/core/generator";

// Components import
import Main from "./components/main";

import osbx_core from "./plugins/osbx_core"

console.clear();
console.log("### STARTING NEW BUILD ###");
let start_time = new Date();

// Register any new components in this array
const COMPONENTS = [
    new Main([osbx_core])
];

// Storyboard build
Generator.MakeStoryboard(COMPONENTS, package_file.config.beatmap_path, start_time);
