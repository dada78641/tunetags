#!/usr/bin/env node
// clitool <https://github.com/dada78641/clitool>
// © MIT license

import {ArgumentParser} from 'argparse'
import pkgData from '../../package.json' with {type: 'json'}

const main = async () => {
  const parser = new ArgumentParser({
    add_help: true,
    description: `${pkgData.description}.`
  })

  parser.add_argument('-v', '--version', {action: 'version', version: `${pkgData.version}`})
  parser.add_argument('FILE', {help: 'path to an audio file', metavar: 'PATH', nargs: 1})
  
  const args = {...parser.parse_args()}
  const file = args.FILE[0]!

  const {parseFileTags} = await import('../index.js')
  const tags = await parseFileTags(file)
  console.log(JSON.stringify(tags, null, 2))
}

main()
