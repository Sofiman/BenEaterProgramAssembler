const fs = require('fs')
const chalk = require('chalk')
const parser = require('./parser')
let args = process.argv.slice(2)

const shouldShowSteps = args.indexOf('-S') >= 0 || args.indexOf('--steps') >= 0
const shouldShowPseudoCode = args.indexOf('-p') >= 0 || args.indexOf('--pscode') >= 0
const useOutputFormatting = args.indexOf('-O') >= 0 || args.indexOf('--format') >= 0

let dictionnary = 'dictionnary.json'

for(let i in args){
    let arg = args[i]
    if(arg.startsWith('-d=') || arg.startsWith('--dict=')){
        if(args[i]){
            let path = args[i].split('=')[1]
            if(fs.existsSync(path) && path.endsWith('.json')){
                dictionnary = path
            } else {
                console.warn('Warning: Invalid file or file format for the defined dictionnary (Compile using default dictionnary)')
            }
        }
        break
    }
}


args = args.filter(arg => !arg.startsWith('-'))
let inputFile = ''

for(let i in args){
    let f = args[i]
    if(!f.startsWith('-') && fs.existsSync(f)){
        inputFile = f
        break
    }
}

if(!fs.existsSync(inputFile)){
    console.error('The specified input is invalid or not found.')
    process.exit(2)
}
const input = fs.readFileSync(inputFile, 'utf8')
const lines = input.split('\n')

if(!fs.existsSync(dictionnary)){
    console.error('Internal Error: Cannot find dictionnary file!')
    process.exit(2)
}
dictionnary = JSON.parse(fs.readFileSync(dictionnary, 'UTF-8'))
let block = parser.createBlock(dictionnary)

let line
for(i in lines){
    line = lines[i]
    let result = parser.addLine(block, i, line)
    if(!result.error){
        block = result
    } else {
        error(result.type, result.error, i, result.extra)
        break
    }
}

parser.resolve(block, result => {
    if(result.error){
        error(result.type, result.error, result.line, result.extra)
    }
    let data = parser.process(result, {steps: shouldShowSteps, pseudoCode: shouldShowPseudoCode})
    if(shouldShowSteps){
        showSteps(data)
    } else {
        let keys = Object.keys(data)
        if(!useOutputFormatting)
            console.log(ft('Addr', keys[0].substring(1)), 'Code' + (shouldShowPseudoCode ? '     | Statement' : ''))
        for(let entry in data){
            if(useOutputFormatting)
                console.log(data[entry])
            else
                console.log(entry.substring(1), ' ', data[entry], shouldShowPseudoCode ? '  ' + lines[keys.indexOf(entry)] : '')
        }
    }
})

function showSteps(data){
    let keys = Object.keys(data)
    console.log('Press ENTER to continue over all steps (' + keys.length + ')')
    let i = 0
    process.stdin.on('data', () => {
        if(i == keys.length){
            process.exit(0)
        }
        let addr = keys[i].substring(1)
        let code = data[keys[i]]
        let len = code.length / 2
        console.log(ft('Addr', addr) + ' Code' + (shouldShowPseudoCode ? '     | Statement' : ''), chalk.magentaBright(`[Step #${i + 1}]`))
        console.log(chalk.yellowBright(addr), ' ', 
                    (lines[i].startsWith(':') ? chalk.greenBright(code.substring(0, len)) : chalk.blue(code.substring(0, len))) 
                    + chalk.greenBright(code.substring(len)), shouldShowPseudoCode ? '  ' + lines[i] : '')
        i++
    })
}

function error(type, message, line, extra){
    console.error(type + ' at line ' + (parseInt(line) + 1) + ': ' + message + '.' + (extra ? ' ' + type + ': ' + extra : ''))
    process.exit(1)
}

function ft(str, target, seperator ='|'){
    for (let i = str.length; i < target.length + 1; i++){
        str += ' '
    }
    return str + seperator
}