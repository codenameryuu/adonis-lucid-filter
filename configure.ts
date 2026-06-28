import type Configure from "@adonisjs/core/commands/configure";

export async function configure(command: Configure) {
  const codemods = await command.createCodemods();

  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider("@codenameryuu/adonis-lucid-filter/provider");
    rcFile.addCommand("@codenameryuu/adonis-lucid-filter/commands");
  });
}
