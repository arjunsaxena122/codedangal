import axios from "axios";
import { env } from "../config/config";

const options = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.SULU_JUDGE0_API_KEY}`,
    Accept: "application/json",
  },
};

const wait = (s: number) => new Promise((resolve) => setTimeout(resolve, s));

const getLanguageId = async (language: string) => {
  const { data } = await axios.get(`${env.SULU_JUDGE0_URL}/languages`, options);

  let langId;
  for (const { id, name } of data) {
    if (name.trim() == language.trim()) {
      return (langId = id);
    }
  }

  return langId;
};

const createSubmissionBatch = async (submission: string) => {
  const { data } = await axios.post(
    `${env.SULU_JUDGE0_URL}/submissions/batch`,
    { submissions: submission },
    options,
  );

  // ? submission tokens
  return data;
};

const getSubmissionResult = async (tokens: string[]) => {
  type submissionResult = {
    status: {
      id: number;
    };
  };


  while (true) {
    const { data } = await axios.get(
      `${env.SULU_JUDGE0_URL}/submissions/batch`,
      {
        params: {
            tokens : tokens.join(",")
        },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${env.SULU_JUDGE0_API_KEY}`,
        },
      },
    );


    const results = data?.submissions;
    console.log(results);

    const isAllDone = results?.every(
      (result: submissionResult) =>
        result.status.id !== 1 && result.status.id !== 2,
    );

    if (isAllDone) return results;

    await wait(2);
  }
};

export { getLanguageId, createSubmissionBatch, getSubmissionResult };
