import axios from "axios";

import { environment as env } from "../environment";

export default axios.create({
    baseURL: env.backendURI,
});
