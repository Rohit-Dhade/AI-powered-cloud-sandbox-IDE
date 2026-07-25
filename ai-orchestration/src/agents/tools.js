import axios from "axios";
import { tool } from "langchain";
import * as z from "zod";

/**
 * Creates sandbox tools bound to a specific sandbox agent service URL.
 * @param {string} sandboxServiceUrl - e.g. "http://sandbox-service-<id>:3000"
 */

export const listfiles = tool(
  async ({ }, config) => {

    const writer = config.configurable?.writer ?? (() => { });

    writer("Listing files in project directories...\n");

    const response = await axios.get(`http://sandbox-service-${config.configurable.sandboxId.trim()}:3000/list-files`);

    writer("Listing files successfully:" + "files: " + response.data.files.join(",") + "\n");


    return JSON.stringify(response.data.files);
  },
  {
    name: "listfiles",
    description:
      "List all files in the project directory. This is useful for understanding what files are available to work with.",
    schema: z.object({}),
  },
);

export const readfiles = tool(
  async ({ files = [] }, config) => {

    const writer = config.configurable?.writer ?? (() => { });

    writer("Reading files from project directories...\n");

    const response = await axios.get(
      `http://sandbox-service-${config.configurable.sandboxId.trim()}:3000/read-files?files=` + files.join(","),
    );

    writer("Files Reading : " + response.data.results.join(",") + "\n");

    return JSON.stringify(response.data.results);
  },
  {
    name: "readfiles",
    description:
      "Read the contents of specified files. This is useful for examining the content of files that are relevant to the task at hand.",
    schema: z.object({
      files: z
        .array(z.string())
        .default([])
        .describe(
          "List of files absolute paths to read. These should be the files that were listed using listfiles tool or created later using the write_file tool.",
        ),
    }),
  },
);

export const updateFiles = tool(
  async ({ files }, config) => {

    const writer = config.configurable?.writer ?? (() => { });

    writer("Updating files in project directories...\n");

    const response = await axios.patch(`http://sandbox-service-${config.configurable.sandboxId.trim()}:3000/update-files`, {
      updates: files,
    });

    writer("Files updated successfully: " + response.data.results.map((result) => result.file).join("\n") + "\n");

    return JSON.stringify(response.data.results);
  },
  {
    name: "updateFiles",
    description:
      "Update the contents of specified files. This is useful for modifying the content of files that are relevant to the task at hand. This tool can also use to create new files by providing a new file name in the file field and the content to be added in the content field.",
    schema: z.object({
      files: z
        .array(
          z.object({
            file: z.string(),
            content: z.string(),
          }),
        )
        .default([])
        .describe(
          "List of file updates to apply. Each item should contain a file path and the new content.",
        ),
    }),
  },
);
