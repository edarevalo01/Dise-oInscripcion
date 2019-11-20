import StringResource from "src/assets/resources/es.json";

export class StringResourceHelper {
  constructor(private rootNode: string) {}

  public getResource(nodeLeaf: string) {
    return StringResource[this.rootNode][nodeLeaf];
  }
}
