import arg from 'arg';
import inquirer from 'inquirer';
import fs, { unwatchFile } from 'fs';import path from 'path';

export async function cli(args) {
    let options = parseArguments(args);
    if (!options.action) {
        options.action = await setupAction(options);
    }
    switch (options.action) {
        case 'create-project':
            createProject();
            break;

        case 'make':
            console.log("osbx: command currently not supported.");
            break;

        case 'install':
            console.log("osbx: command currently not supported.");
            break;

        default:
            console.log("osbx: unknown command.");
            break;
    }
}

async function setupAction(options) {
    const questions = [];
    questions.push({
        type: 'list',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
            'create-project',
            'make',
            'install'
        ],
        default: 'create-project'
    });
    const anwsers = await inquirer.prompt(questions);
    return anwsers.action;
}

async function createProject() {
    const questions = [];
    questions.push({
        type: 'input',
        name: 'name',
        message: 'What the name of your project?',
        default: 'osbx-project'
    });

    questions.push({
        type: 'confirm',
        name: 'component',
        message: 'Do you want to initialize a main component?',
        default: true
    });

    questions.push({
        type: 'checkbox',
        name: 'plugins',
        message: 'Which plugins do you want to install?',
        choices: [
            'osbx/core'
        ],
        default: ['osbx/core']
    });

    questions.push({
        type: 'input',
        name: 'beatmap_path',
        message: 'What is the path to your osu beatmap folder?',
        default: 'C:/.../beatmap/map.osu'
    });

    const answers = await inquirer.prompt(questions);

    if (fs.existsSync(`./${answers.name}/`)) {
        console.log(`ERROR: Project ${answers.name} already exist.`);
        return;
    }

    try {
        fs.openSync(answers.beatmap_path);
    } catch (error) {
        console.log("ERROR: Beatmap file not valid.");
        throw error;
    }

    const { exec } = require("child_process");
    const process = require("process");
    const ncp = require('ncp').ncp;

    let currentFileUrl = import.meta.url;
    const isWindows = require('is-windows');
    if (isWindows()) {
        const uri2file = require('file-uri-to-path');
        currentFileUrl = uri2file(currentFileUrl);
    }


    const templateDirectory = path.resolve(
        new URL(currentFileUrl).pathname, `../../templates/${answers.component ? "base_component" : "base"}`
    );

    // INSTALL
    ncp.limit = 16;
    ncp(templateDirectory, answers.name, function (err) {
        if (err) return console.error(err);
        console.log('Generated project files');
        console.log('Installing dependencies...');

        process.chdir(answers.name);
        const package_file = {
            name: answers.name,
            version: "1.0.0",
            description: "An osbx project",
            main: "storyboard.ts",
            dependencies: {
                "@types/node": "^15.12.2",
                "osbx": "^1.0.1",
                "typescript": "^4.3.2"
            },
            scripts: {
                storyboard: "nodemon ./storyboard.ts -q"
            },
            author: "Username",
            license: "MIT",
            config: {
                "beatmap_path": answers.beatmap_path
            }
        }

        fs.writeFileSync('./package.json', JSON.stringify(package_file), "utf-8");
        exec("git init -q && npm install", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
        });

        console.log(`Updating osbx to latest...`);
        exec("npm install osbx@latest", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
        });

        console.log(`Generating .gitignore file...`);
        fs.writeFileSync('./.gitignore', `node_modules/\nplugins\npackage-lock.json\ntsconfig.json`);
        console.log(`Project have been initialized in ./${answers.name}! use npm run storyboard to generate osb file!`);
    });
}

function parseArguments(raw_args) {
    const args = arg(
        {
            '--quick': Boolean,
            '-q': '--quick'
        },
        {
            argv: raw_args.slice(2),
        });
    return {
        quick: args['--quick'] || false,
        action: args._[0],
    }
}
