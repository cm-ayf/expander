import readenv from '@cm-ayf/readenv';

if (process.env.NODE_ENV !== 'production')
  require('dotenv').config();

const env = readenv({ BOT_TOKEN: {} });
export default env;
