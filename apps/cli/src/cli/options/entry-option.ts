import { Option } from 'commander'

export const entryOption = new Option(
  '-e, --entry <entry>',
  'The entry files to search for routes',
).default(
  'index.js,index.ts,index.jsx,index.tsx,main.js,main.ts,main.jsx,main.tsx,app.js,app.ts,app.jsx,app.tsx,src/index.js,src/index.ts,src/index.jsx,src/index.tsx,src/main.js,src/main.ts,src/main.jsx,src/main.tsx,src/app.js,src/app.ts,src/app.jsx,src/app.tsx',
  '(src)?/(index|main|app).(js|ts|jsx|tsx)',
)
