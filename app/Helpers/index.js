'use strict'

const crypto = use('crypto')
const Helpers = use('Helpers')
// const fs = use('fs')

/**
 * Generate random aplhanumeric string
 *
 * @param { int } length -  The length of the string
 * @return { string }       The Result
 */
const str_random = async (length = 40) => {
    let string = ''
    let len = string.length

    if (len < length) {
        let size = length - len
        let bytes = await crypto.randomBytes(size)
        let buffer = new Buffer(bytes)

        string += buffer
            .toString('base64')
            .replace(/[^a-zA-Z0-9]/g, '')
            .substr(0, size)
    }
    return string
}

/**
 * Move a given file for the spcified path, if none is specified, move file to 'public/uploads' path.
 * @param {FileJar} file
 * @param {string} path
 */
const manage_single_upload = async (file, path = null) => {
    path = path ? path : Helpers.publicPath('uploads')
    // gera um nome aleatório
    const random_name = await str_random(30)
    let filename = `${new Date().getTime()}-${random_name}.${file.subtype}`

    // renomeia o arquivo e move para a pasta public/uploads
    await file.move(path, {
        name: filename
    })

    return file
}

/**
 * Move a given file list for the spcified path, if none is specified, move files to 'public/uploads' path.
 * @param {Filejar} fileJar
 * @param {string} path
 * @return { object }
 */
const manage_multiple_uploads = async (fileJar, path = null) => {
    path = path ? path : Helpers.publicPath('uploads')
    let successes = []
    let errors = []

    await Promise.all(
        fileJar.files.map(async file => {
            let random_name = await str_random(30)
            let filename = `${new Date().getTime()}-${random_name}.${
                file.subtype
            }`
            await file.move(path, {
                name: filename
            })

            if (file.moved()) {
                successes.push(file)
            } else {
                errors.push(file.error())
            }
        })
    )
    return { successes, errors }
}

/**
 * Calculate a percentage value from a given value
 *
 * @param {Number} baseValue
 * @param {Number} percentage
 * @return {Number} the percentage value
 */
const calcPercent = (basevalue, percentage) => {
    return (basevalue / 100) * percentage
}

module.exports = {
    str_random,
    manage_single_upload,
    manage_multiple_uploads,
    calcPercent
}
