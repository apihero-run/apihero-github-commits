import { git } from "@apihero/github";
import { fetchEndpoint } from "@apihero/node";

async function createCommit(owner: string, repo: string, branch: string) {
  const ref = await fetchEndpoint(git.getRef, {
    owner,
    repo,
    ref: `heads/${branch}`,
  });

  if (ref.status === "error") {
    throw ref.error;
  }

  const commitTree = await fetchEndpoint(git.createTree, {
    owner,
    repo,
    tree: {
      tree: [
        {
          path: `playground/${Date.now()}.txt`,
          mode: "100644",
          type: "blob",
          content: `The time is ${new Date().toISOString()}`,
        },
      ],
      base_tree: ref.body.object.sha,
    },
  });

  if (commitTree.status === "error") {
    throw commitTree.error;
  }

  const commit = await fetchEndpoint(git.createCommit, {
    owner,
    repo,
    commit: {
      message: "Create a new file",
      tree: commitTree.body.sha,
      parents: [ref.body.object.sha],
    },
  });

  if (commit.status === "error") {
    throw commit.error;
  }

  const updatedRef = await fetchEndpoint(git.updateRef, {
    owner,
    repo,
    ref: `heads/${branch}`,
    payload: {
      sha: commit.body.sha,
    },
  });
}

createCommit("apihero-run", "apihero-github-commits", "commit-playground");
