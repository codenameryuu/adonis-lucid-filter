import { BaseCommand, args } from "@adonisjs/core/ace";
import { stubsRoot } from "../stubs/main.js";

export default class MakeFilter extends BaseCommand {
  static commandName = "make:filter";
  static description = "Make a new Lucid filter";

  /**
   * The name of the model file.
   */
  @args.string({ description: "Name of the model file" })
  declare name: string;

  /**
   * Run command
   */
  async run(): Promise<void> {
    const codemods = await this.createCodemods();

    await codemods.makeUsingStub(stubsRoot, "make/filter/main.stub", {
      name: this.name,
    });
  }
}
