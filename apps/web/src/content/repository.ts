import data from "./fundamental-rights.json";
import type { GraphRelease } from "./types";
/** Repository boundary: a Firestore implementation can replace this local release. */
export interface GraphRepository {
  load(): Promise<GraphRelease>;
}
export const bundledRepository: GraphRepository = {
  async load() {
    return data as GraphRelease;
  },
};
