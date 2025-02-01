// import fs from "node:fs";
// import axios from "axios";
// // import FormData from "form-data";


// const genAI = process.env.GOOGLE_GEMINI_API

// const payload = {
//     prompt: "Lighthouse on a cliff overlooking the ocean",
//     output_format: "webp"
// };

// const response = await axios.postForm(
//     `https://api.stability.ai/v2beta/stable-image/generate/core`,
//     axios.toFormData(payload, new FormData()),
//     {
//         validateStatus: undefined,
//         responseType: "arraybuffer",
//         headers: {
//             Authorization: `Bearer sk-MYAPIKEY`,
//             Accept: "image/*"
//         },
//     },
// );

// if (response.status === 200) {
//     fs.writeFileSync("./lighthouse.webp", Buffer.from(response.data));
// } else {
//     throw new Error(`${response.status}: ${response.data.toString()}`);
// }