import inquirer from 'inquirer'
import fs from 'fs-extra'
import path from 'path'
import seedrandom from 'seedrandom'

const getRandomInt = max => Math.floor(Math.random() * max)

const generateRandomString = length => {
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    return Array.from({ length }, () => chars.charAt(getRandomInt(chars.length))).join('')
}

const generateFileContent = ext => {
    switch (ext) {
        case 'txt':
        case 'md':
            return 'This is a dummy text file.\n'.repeat(3)
        case 'json':
            return JSON.stringify({ message: 'This is a dummy JSON file.' }, null, 2)
        case 'jpg':
        case 'png':
            return Buffer.alloc(10); //dummy binary data
        default:
            return 'Dummy file content.\n'
    }
}

const createStructure = (dir, levels, extensions, maxDirs, maxFiles) => {
    if (levels === 0) return

    const DirCount = getRandomInt(maxDirs) + 1
    for (let i = 0; i < DirCount; i++) {
        const DirName = generateRandomString(5)
        const DirPath = path.join(dir, DirName)

        fs.ensureDirSync(DirPath)

        const fileCount = getRandomInt(maxFiles) + 1
        for (let j = 0; j < fileCount; j++) {
            const fileExtension = extensions[getRandomInt(extensions.length)]
            const fileName = generateRandomString(5) + '.' + fileExtension
            const filePath = path.join(DirPath, fileName)

            const content = generateFileContent(fileExtension)
            fs.writeFileSync(filePath, content)
        }

        createStructure(DirPath, levels - 1, extensions, maxDirs, maxFiles)
    }
}

const main = async () => {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'topDir',
            message: 'top dir name:',
            default: './dummy'
        },
        {
            type: 'number',
            name: 'levels',
            message: 'levels:',
            default: 3
        },
        {
            type: 'input',
            name: 'extensions',
            message: 'Extensions(comma delimited):',
            default: 'txt'
        },
        {
            type: 'number',
            name: 'maxDirs',
            message: 'Max dirs/level:',
            default: 3
        },
        {
            type: 'number',
            name: 'maxFiles',
            message: 'Max files/dir:',
            default: 3
        },
        {
            type: 'input',
            name: 'seed',
            message: 'Random Seed(empty => new):',
            default: ''
        },
    ])

    const seed = answers.seed || Date.now().toString()
    // Overrides Math.random() with global option
    seedrandom(seed, { global: true })

    // if top dir exists, remove it
    if (fs.existsSync(answers.topDir)) {
        fs.rmSync(answers.topDir, { recursive: true, force: true })
    }

    fs.ensureDirSync(answers.topDir)

    const extensions = answers.extensions.split(',').map(ext => ext.trim())
    createStructure(answers.topDir, answers.levels, extensions, answers.maxDirs, answers.maxFiles)


    console.log(`Done!\nRandom seed: ${seed}`)
}

main()
