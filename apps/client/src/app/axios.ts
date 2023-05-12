import axios from "axios";

import { environment as env } from "../environment";

const instance = axios.create({
    baseURL: env.backendURI,
});

export default instance;
