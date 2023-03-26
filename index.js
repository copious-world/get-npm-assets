#!/usr/bin/env node

const fsPromises = require('fs/promises')
const path = require('path')

const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);



async function load_json_file(filename) {
    try {
        let conf_str = await fsPromises.readFile(filename)
        let conf_obj = JSON.parse(conf_str)
        return conf_obj
    } catch (e) {
        console.log(e)
        console.log(filename)
    }
    return false
}

// // // // // // // // // // // // // // // // // // // // // // //
let prog_name = process.argv[2]

if ( prog_name === undefined ) {
    console.log("No program or package name has been defined")
    process.exit(1)
}


// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
console.log(`Searching for assets for ${prog_name}`)
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----


async function get_prefix() {
    const { stdout, stderr } = await exec('npm config get prefix');
    return stdout.trim()
}

async function get_bin_dir() {
    const { stdout, stderr } = await exec('npm -g bin');
    return stdout.trim()
}

async function show_node_modules(prefix) {
    prefix = prefix.trim()
    const { stdout, stderr } = await exec(`ls ${prefix}/lib/node_modules/`);
    return stdout
}

async function show_ls(bindir) {
    bindir = bindir.trim()
    const { stdout, stderr } = await exec(`ls ${bindir}`);
    return stdout
}


function extract_mod_path(prog_loc_data) {
    let paths = prog_loc_data.split('/')
    let node_m_index = paths.indexOf('node_modules')
    node_m_index += 2
    let part = paths.splice(0,node_m_index)
    let mod_path = part.join('/')
    return mod_path
}

async function get_executable_module(prefix,prog_name) {
    const { stdout, stderr } = await exec(`ls -l ${prog_name}`);

    let prog_loc_data = stdout.substring(stdout.lastIndexOf('../')+2)

    let mod_path = extract_mod_path(prog_loc_data)

    let module_path = prefix + mod_path

    return module_path
}

// get_moveable_files
// once the module directoy has been found, search for assets in the directory (just use ls)
// run three `ls` commands with one glob pattern for each. In the end, create a `move map`. 
// The move map will include the results of each ls command as: 1.  "conf", 2. assets directory, 3. an asset map file 
async function get_moveable_files(mod_path) {
    let queries = [
        `${mod_path}/*.conf`,
        `${mod_path}/assets/`,
        `${mod_path}/asset-map.json`,
    ]

    let results = queries.map(async (qry) => {
        try {
            let moveables = await show_ls(qry)
            moveables = moveables.split(/\s+/)
            moveables = moveables.filter(entry => entry.length ? true : false )
            return moveables
        } catch(e) {
            return false
        }
    })

    let moveables = await Promise.all(results)
    let move_map = {
        "confs" : moveables[0],
        "dir" : moveables[1],
        "map" :(moveables[2] ? moveables[2][0] : false)
    }
    return move_map
}


async function run_utility() {
    //
    let prefix = await get_prefix()
    let bindir = await  get_bin_dir()

    console.log(prefix)
    console.log(bindir)

    let lib_list = await show_node_modules(prefix)
    lib_list = lib_list.split('\n')
    lib_list = lib_list.map((entry) => {
        return entry.trim()
    })

    let mod_index = lib_list.indexOf(prog_name)

    let bin_list = await show_ls(bindir)
    bin_list = bin_list.split('\n')
    bin_list = bin_list.map((entry) => {
        return entry.trim()
    })

    let bin_index = bin_list.indexOf(prog_name)

    let move_files_list = {}

    if ( (mod_index >= 0) || (bin_index >= 0) ) {
        // ---- ---- ---- ---- ---- ---- ----
        let mod_path = ""
        // ---- ---- ---- ---- ---- ---- ----
        if ( bin_index >= 0 ) {
            console.log(`${prog_name} has been found as an executable`)
            mod_path = await get_executable_module(prefix,`${bindir}/${prog_name}`)
            console.log(mod_path)
        } else if ( mod_index >= 0 ) {
            console.log(`${prog_name} has been found as a module`)
            mod_path = `${prefix}/lib/node_modules//${prog_name}`
        } 

        move_files_list = await get_moveable_files(mod_path)
        //
        if ( move_files_list["map"] ) {     // MAP FILE ... the asset map file has been found
            //
            let filename = move_files_list["map"]
            console.log(filename)
            let jobj = await load_json_file(filename)
            if ( jobj ) {
                let file_to_move = jobj[prog_name]          //  one file per command name (see package.json for the bin list)
                if ( Array.isArray(file_to_move) ) {
                    let promises = []
                    for ( let file of file_to_move ) {
                        let in_file = `${mod_path}/${file}`
                        let p = fsPromises.copyFile(in_file,`./${file}`)
                        promises.push(p)
                    }
                    if ( promises.length ) await Promise.all(promises)
                } else if ( typeof file_to_move === 'string' ) {
                    let in_file = `${mod_path}/${file_to_move}`
                    await fsPromises.copyFile(in_file,`./${file_to_move}`)    
                }
            }
            //
        } else if ( move_files_list["dir"] ) {          //  DIRECTORY ...  assets directory ... 
            try {
                await fsPromises.mkdir('./assets')
            } catch(e) {}
            let moveables = move_files_list["dir"]
            if ( moveables ) {
                for ( let conf of moveables ) {
                    let outfile = path.basename(conf)
                    let in_file = `${mod_path}/assets/${outfile}`
                    try {
                        await fsPromises.copyFile(in_file,`./assets/${outfile}`)
                    } catch (e) {
                        try {
                            await fsPromises.mkdir(`./assets/${outfile}`)
                        } catch (e) {}
                    }
                }
            }
        } else {            // CONF FILES ... the last possibiity is just grabbing the *.conf files....
            let moveables = move_files_list["confs"]
            if ( moveables ) {
                for ( let conf of moveables ) {
                    let outfile = path.basename(conf)
                    await fsPromises.copyFile(conf,`./${outfile}`)
                }
            }
        }
    } else {
        console.log(`${prog_name} was not found`)
    }
}


run_utility()