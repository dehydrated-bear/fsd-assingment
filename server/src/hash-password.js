import { hashPassword } from './auth.js'
if (!process.stdin.isTTY) {
  console.error('Run this in an interactive terminal.')
  process.exit(1)
}
process.stdout.write(
  'Choose an admin password (12–256 characters; input hidden): ',
)
process.stdin.setRawMode(true)
process.stdin.setEncoding('utf8')
let password = ''
process.stdin.on('data', (chunk) => {
  for (const character of chunk) {
    if (character === '\u0003') {
      process.stdin.setRawMode(false)
      process.exit(1)
    }
    if (character === '\r' || character === '\n') {
      process.stdin.setRawMode(false)
      if (password.length < 12 || password.length > 256) {
        console.error('\nUse 12–256 characters.')
        process.exit(1)
      }
      console.log(
        `\nAdd this line to server/.env (not to GitHub):\nADMIN_PASSWORD_HASH=${hashPassword(password)}`,
      )
      process.exit(0)
    } else if (character === '\u007f') password = password.slice(0, -1)
    else password += character
  }
})
