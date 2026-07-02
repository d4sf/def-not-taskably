import { input } from "@inquirer/prompts";

interface DateConfig {
  message: string;
  default?: Date;
}

export async function date(config: DateConfig): Promise<Date | undefined> {
  const defaultStr = config.default?.toISOString().split("T")[0];
  const dateStr = await input({
    message: `${config.message} (YYYY-MM-DD)`,
    default: defaultStr,
    validate: (value: string) => {
      if (!value) return true;
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "Please enter a valid date (YYYY-MM-DD)";
      return true;
    },
  });

  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
