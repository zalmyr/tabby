#!/usr/bin/env node
// russh's loader has no entry for 32-bit Windows; point it at the binding built in CI
import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const file = path.resolve(__dirname, '../app/node_modules/russh/lib/native.js')

const src = fs.readFileSync(file, 'utf-8')
if (src.includes('win32-ia32-msvc')) {
    process.exit(0)
}
const anchor = "arm64: 'win32-arm64-msvc'"
if (!src.includes(anchor)) {
    throw new Error(`Unexpected russh loader in ${file}`)
}
fs.writeFileSync(file, src.replace(anchor, `${anchor},\n        ia32: 'win32-ia32-msvc'`))
console.log('Patched', file)
