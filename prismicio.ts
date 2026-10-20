import {
  createClient as baseCreateClient,
  type ClientConfig,
} from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import prismicConfig from "./prismic.config.json";

/**
 * The project's Prismic repository name.
 */
export const repositoryName =
  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || prismicConfig.repositoryName;

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param config - Configuration for the Prismic client.
 */
export const createClient = (config: ClientConfig = {}) => {
  const client = baseCreateClient(repositoryName, {
    routes: prismicConfig.routes,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    fetchOptions: { cache: "no-store" },
    ...config,
  });

  enableAutoPreviews({ client });

  return client;
};

/** Use inside cached queries; read the preview ref outside the cache scope. */
export const createContentClient = () =>
  baseCreateClient(repositoryName, {
    routes: prismicConfig.routes,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    fetchOptions: { cache: "no-store" },
  });
