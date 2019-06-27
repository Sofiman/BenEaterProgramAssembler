function createBlock(dictionnary){
    Object.keys(dictionnary.instructions).forEach(key => {
        dictionnary.instructions[key] = parseInt(dictionnary.instructions[key], 2)
    })
    if(!dictionnary.memory_size){
        dictionnary.memory_size = 16
    }
    return {
        variables: {},
        code: [],
        dictionnary
    }
}

function addLine(block, address, line){
    const parts = line.replace('\r', '').split(',')
    let start = parts[0]
    let argument = parts[1]
    if(block.dictionnary.instructions[start] != undefined){
        block.code.push({instruction: start, argument})
    } else if(parts[0].length == 0){
        block.code.push({instruction: 'NOP', argument: undefined})
    } else {
        if(start.startsWith(':')){
            let name = start.substring(1)
            if(!block.variables[name]){
                let val = argument ? (argument.toLowerCase().startsWith('0b') ? parseInt(argument.substring(2), 2) : parseInt(argument)) : 0
                block.variables[name] = {
                    address: parseInt(address),
                    value: argument ? (val & 0xFF) : undefined
                }
                if(val.toString(2).length > 8){
                    console.warn('Warnning: Variable', name, 
                                'cannot fit in 8 bits, only the 8 lower bits are kept! (at line ' + (parseInt(address) + 1) + ')')
                }
            } else {
                return {error: 'Name already taken', extra: 'Variables must have an unique name', type: 'RuntimeError'}
            }
        } else {
            return {error: 'Unknown instruction or Invalid variable declaration', type: 'SyntaxError'}
        }
    }
    return block
}

function resolve(block, cb){
    let i = 0
    block.code.forEach(statement => {
        i++
        if(i > block.dictionnary.memory_size){
            cb({error: 'You program exeeds memory size of the Computer', type: 'MemoryOverflow',
                line: i - 1, extra: 'Your program must fit in ' + block.dictionnary.memory_size + ' bytes'})
        } else if(statement.argument && statement.argument.startsWith('@')){
            let name = statement.argument.substring(1)
            let v = block.variables[name]
            if(!v){
                cb({error: 'No variable with the name \'' + name + '\' defined', type: 'VariableError', line: i})
            }
            statement.argument = v.address
        } else {
            statement.argument = statement.argument ? ((parseInt(statement.argument) - 1) & 0xFF) : undefined
        }
    })
    cb(block)
}

function compile(block, statement){
    let opcode = block.dictionnary.instructions[statement.instruction]
    let addr = statement.argument ? (statement.argument.address || statement.argument) : 0
    return opcode << 4 | addr
}

function process(block, options){
    let data = {}
    let memory_size = block.dictionnary.memory_size
    let padding = m(memory_size, 4)
    let i = 0

    for(i in block.code){
        let addr = bin(i, padding)
        let statement = block.code[i]
        data[addr] = bin(compile(block, statement))
    }

    Object.keys(block.variables).forEach(key => {
        i++
        let addr = bin(i, padding)
        data[addr] = bin(block.variables[key].value)
    })
    return data
}

function bin(dec, padding='00000000'){
    let n = (dec >>> 0).toString(2) // Support for negative numbers
    return padding.substr(n.length) + n
}

function m(scale, base=16){
    let template = '0'
    for (let i = 0; i < Math.round(scale / base); i++){
        template += '0'
    }
    return template
}

module.exports = { createBlock, addLine, resolve, process }