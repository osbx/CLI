import package_file = require("./package.json");
import Generator from "osbx/lib/core/generator";


console.clear();
console.log("### STARTING NEW BUILD ###");
let start_time = new Date();

// Register any new components in this array
const COMPONENTS = [
    //Add your components in this array
    //new Component_class([plugin,plugin,...])
];

// Storyboard build
Generator.MakeStoryboard(COMPONENTS, package_file.config.beatmap_path, start_time);
