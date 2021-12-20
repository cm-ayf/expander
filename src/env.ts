import readenv from "@cm-ayf/readenv";
import dotenv from "dotenv";

dotenv.config();

const env = readenv({ BOT_TOKEN: {} });
export default env;
