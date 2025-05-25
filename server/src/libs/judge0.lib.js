import axios from "axios";
import config from "../config/config.js";
import { sleep } from "../utils/index.js";

const getJudge0LanguageId = (language) => {
  const languageId = {
    Javascript: 63,
    Python: 71,
    "C++": 54,
  };

  let caps = language;
  language = caps[0].toUpperCase() + caps.slice(1, caps.length);
  return languageId[language];
};

const submitBatch = async (submission) => {
  const { data } = await axios.put(
    `${config.judge0_uri}/submissions/batch?base64_encoded=false`,
    {
      submission,
    }
  );
  console.log(`submit batch data ${data}`);

  return data;
};

const pollBatchResults = async (token) => {
  while (true) {
    const { data } = await axios.get(`${config.judge0_uri}/submissions/batch`, {
      params: {
        tokens: token.join(","),
        base64_encoded: false,
      },
    });

    console.log("polling batch data", data);

    const results = data.submission;
    console.log("polling batch results", results);

    const isAllDone = results.every(
      (cond) => cond.status.id !== 1 && cond.status.id !== 2
    );

    if (isAllDone) return results;

    await sleep(10);
  }
};

export { getJudge0LanguageId, submitBatch, pollBatchResults };
